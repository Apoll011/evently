import { Injectable, OnModuleInit } from '@nestjs/common';
import { readFile } from 'node:fs/promises';
import { hash, sign, verify } from 'crypto';
import { FieldValue } from '../orders/dto/create-order.dto';
import zlib from 'zlib';

export type SignTicket = {
	orderId: string;
	eventId: string;
	holderName: string | null;
	holderEmail: string | null;
	customFields: FieldValue[];
};

type TicketHash = {
	orderId: string;
	eventId: string;
	holderNameHash: string;
	holderEmailHash: string;
	customFieldsHash: string;
};

@Injectable()
export class TicketSigningService implements OnModuleInit {
	private privateKey!: string;
	private publicKey!: string;

	async onModuleInit() {
		const [privateKey, publicKey] = await Promise.all([
			readFile('./keys/private.pem', 'utf8'),
			readFile('./keys/public.pem', 'utf8'),
		]);
		this.privateKey = privateKey;
		this.publicKey = publicKey;
	}

	sign(ticket: SignTicket): string {
		const encoded = this.encode(this.hashTicket(ticket));
		return sign(null, Buffer.from(encoded), this.privateKey).toString(
			'base64',
		);
	}

	verify(ticket: SignTicket, signature: string): boolean {
		return this.verifyHash(this.hashTicket(ticket), signature);
	}

	verifyHash(ticket: TicketHash, signature: string): boolean {
		const encoded = this.encode(ticket);
		return verify(
			null,
			Buffer.from(encoded),
			this.publicKey,
			Buffer.from(signature, 'base64'),
		);
	}

	private hashTicket(ticket: SignTicket): TicketHash {
		return {
			orderId: ticket.orderId,
			eventId: ticket.eventId,
			holderNameHash: hash('sha256', ticket.holderName ?? 'default'),
			holderEmailHash: hash('sha256', ticket.holderEmail ?? 'default'),
			customFieldsHash: this.hashCustomFields(ticket.customFields),
		};
	}

	private hashCustomFields(fields: FieldValue[]): string {
		const text = fields.reduce(
			(acc, field) => acc + '(' + field.label + ':' + field.value + ')',
			'#',
		);
		return hash('sha256', text);
	}

	private encode(ticket: TicketHash): string {
		return `${ticket.orderId}-${ticket.eventId}===${ticket.holderNameHash}-${ticket.holderEmailHash}-${ticket.customFieldsHash}`;
	}

	compress(ticket: TicketHash): string {
		const json = JSON.stringify(ticket);
		const compressed = zlib.gzipSync(json);
		return compressed
			.toString('base64')
			.replace(/\+/g, '-')
			.replace(/\//g, '_')
			.replace(/=+$/, '');
	}

	decompress(data: string): TicketHash {
		data = data.replace(/-/g, '+').replace(/_/g, '/');
		const pad = data.length % 4;
		if (pad) data += '='.repeat(4 - pad);

		const buffer = Buffer.from(data, 'base64');
		const json = zlib.gunzipSync(buffer).toString('utf8');
		return JSON.parse(json) as TicketHash;
	}
}
