import { Injectable, OnModuleInit } from '@nestjs/common';
import { readFile } from 'node:fs/promises';
import {
	createHash,
	sign,
	verify,
	createPrivateKey,
	createPublicKey,
	KeyObject,
} from 'node:crypto';
import { FieldValue } from '../orders/dto/create-order.dto';

export type SignTicket = {
	typeId: string;
	orderId: string;
	eventId: string;
	index: number;
	holderName: string | null;
	customFields: FieldValue[];
};

export type TicketHash = {
	eventId: string;
	index: number;
	orderIdHash: string;
	typeIdHash: string;
	holderNameHash: string;
	customFieldsHash: string;
};

const HASH_BYTES = 4;
export const FORMAT_VERSION = 5;
const UUID_RE =
	/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const UUID_MARKER = 0xff;

@Injectable()
export class TicketSigningService implements OnModuleInit {
	private privateKey!: KeyObject;
	private publicKey!: KeyObject;
	id!: string;
	pubKey!: string;

	async onModuleInit() {
		let privateKeyPem: string, publicKeyPem: string, id: string;
		try {
			[privateKeyPem, publicKeyPem, id] = await Promise.all([
				readFile('./keys/private.pem', 'utf8'),
				readFile('./keys/public.pem', 'utf8'),
				readFile('./keys/.id', 'utf8')
			]);
		} catch (err) {
			throw new Error(
				`TicketSigningService: failed to read signing keys from ./keys — ${(err as Error).message}`,
			);
		}

		this.privateKey = createPrivateKey(privateKeyPem);
		this.publicKey = createPublicKey(publicKeyPem);
		this.id = id;
		this.pubKey = publicKeyPem;

		const keyType = this.publicKey.asymmetricKeyType;
		if (keyType !== 'ed25519' && keyType !== 'ed448') {
			throw new Error(
				`TicketSigningService: expected an Ed25519/Ed448 key pair, got "${keyType}". ` +
					`Ed25519 gives 64-byte signatures (vs 256+ for RSA) and is much faster — generate with ` +
					`"openssl genpkey -algorithm ed25519".`,
			);
		}
	}

	/** Sign a ticket. Returns a base64url signature over the canonical binary payload. */
	sign(ticket: SignTicket): string {
		return this.signHashed(this.hashTicket(ticket));
	}

	/** Sign a ticket hash. Returns a base64url signature over the canonical binary payload. */
	signHashed(ticket: TicketHash): string {
		const packed = this.pack(ticket);
		return sign(null, packed, this.privateKey).toString('base64url');
	}

	/** Verify a ticket's claims against a signature. Never throws — returns false on any malformed input. */
	verify(ticket: SignTicket, signature: string): boolean {
		return this.verifyHash(this.hashTicket(ticket), signature);
	}

	verifyPayload(payload: Buffer<ArrayBufferLike>, signature: string): boolean {
		try {
			return verify(
				null,
				payload,
				this.publicKey,
				Buffer.from(signature, 'base64url'),
			);
		} catch {
			return false;
		}
	}

	verifyHash(ticket: TicketHash, signature: string): boolean {
		return this.verifyPayload(this.pack(ticket), signature)
	}

	hashTicket(ticket: SignTicket): TicketHash {
		return {
			index: ticket.index,
			eventId: ticket.eventId,
			orderIdHash: this.hashField(ticket.orderId),
			typeIdHash: this.hashField(ticket.typeId),
			holderNameHash: this.hashField(ticket.holderName),
			customFieldsHash: this.hashCustomFields(ticket.customFields),
		};
	}

	/** The compact wire payload — same bytes that get signed. */
	compress(ticket: TicketHash): string {
		return this.pack(ticket).toString('base64url');
	}

	/** Inverse of compress(). Throws on malformed/truncated input. */
	decompress(data: string): TicketHash {
		return this.unpack(Buffer.from(data, 'base64url'));
	}

	private hashField(value: string | null): string {
		const presence = Buffer.from([value === null ? 0 : 1]);
		const content =
			value === null ? Buffer.alloc(0) : Buffer.from(value, 'utf8');
		return createHash('sha256')
			.update(Buffer.concat([presence, content]))
			.digest('hex')
			.slice(0, HASH_BYTES * 2);
	}

	private hashCustomFields(fields: FieldValue[]): string {
		const canonical = JSON.stringify(fields.map((f) => [f.label, f.value]));
		return createHash('sha256')
			.update(canonical, 'utf8')
			.digest('hex')
			.slice(0, HASH_BYTES * 2);
	}

	private pack(ticket: TicketHash): Buffer {
		return Buffer.concat([
			Buffer.from([FORMAT_VERSION]),
			Buffer.from([ticket.index]),
			this.idToBuffer(ticket.eventId),
			this.hashHexToBuffer(ticket.orderIdHash),
			this.hashHexToBuffer(ticket.typeIdHash),
			this.hashHexToBuffer(ticket.holderNameHash),
			this.hashHexToBuffer(ticket.customFieldsHash),
		]);
	}

	private unpack(buf: Buffer): TicketHash {
		if (buf.length < 1) throw new Error('Ticket payload too short');
		let offset = 0;

		const version = buf.readUInt8(offset);
		offset += 1;
		if (version !== FORMAT_VERSION) {
			throw new Error(`Unsupported ticket format version: ${version}`);
		}

		const index = buf.readUInt8(offset);
		offset += 1;

		const event = this.bufferToId(buf, offset);
		offset = event.next;

		const orderIdHash = this.readHash(buf, offset);
		offset += HASH_BYTES;
		const ticketIdHash = this.readHash(buf, offset);
		offset += HASH_BYTES;
		const holderNameHash = this.readHash(buf, offset);
		offset += HASH_BYTES;
		const customFieldsHash = this.readHash(buf, offset);
		offset += HASH_BYTES;

		if (offset !== buf.length) {
			throw new Error('Ticket payload has unexpected trailing data');
		}

		return {
			index: index,
			eventId: event.id,
			orderIdHash: orderIdHash,
			typeIdHash: ticketIdHash,
			holderNameHash,
			customFieldsHash,
		};
	}

	private idToBuffer(id: string): Buffer {
		if (UUID_RE.test(id)) {
			return Buffer.concat([
				Buffer.from([UUID_MARKER]),
				Buffer.from(id.replace(/-/g, ''), 'hex'),
			]);
		}
		const bytes = Buffer.from(id, 'utf8');
		if (bytes.length >= UUID_MARKER) {
			throw new Error(
				`Identifier too long to encode (${bytes.length} bytes): ${id}`,
			);
		}
		return Buffer.concat([Buffer.from([bytes.length]), bytes]);
	}

	private bufferToId(
		buf: Buffer,
		offset: number,
	): { id: string; next: number } {
		if (offset >= buf.length)
			throw new Error('Ticket payload truncated (id marker)');
		const marker = buf.readUInt8(offset);

		if (marker === UUID_MARKER) {
			if (offset + 17 > buf.length)
				throw new Error('Ticket payload truncated (uuid)');
			const hex = buf.subarray(offset + 1, offset + 17).toString('hex');
			const id = `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
			return { id, next: offset + 17 };
		}

		const len = marker;
		if (offset + 1 + len > buf.length)
			throw new Error('Ticket payload truncated (string id)');
		const id = buf.subarray(offset + 1, offset + 1 + len).toString('utf8');
		return { id, next: offset + 1 + len };
	}

	private hashHexToBuffer(hex: string): Buffer {
		const buf = Buffer.from(hex, 'hex');
		if (buf.length !== HASH_BYTES) {
			throw new Error(
				`Invalid hash length: expected ${HASH_BYTES} bytes, got ${buf.length}`,
			);
		}
		return buf;
	}

	private readHash(buf: Buffer, offset: number): string {
		if (offset + HASH_BYTES > buf.length)
			throw new Error('Ticket payload truncated (hash)');
		return buf.subarray(offset, offset + HASH_BYTES).toString('hex');
	}
}
