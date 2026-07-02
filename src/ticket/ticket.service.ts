import {
	ConflictException,
	Injectable,
	NotFoundException,
	UnauthorizedException,
} from '@nestjs/common';
import { TicketStatus } from '@prisma/client'; // adjust import path/name to match your generated client
import { DbService } from '../db/db.service';
import { FieldValue } from '../orders/dto/create-order.dto';
import {
	FORMAT_VERSION,
	TicketSigningService,
} from '../ticket-signing/ticket-signing.service';

@Injectable()
export class TicketService {
	constructor(
		private db: DbService,
		private readonly ticketSigningService: TicketSigningService,
	) {}

	findOne(id: string) {
		return this.db.ticket.findUnique({ where: { id } });
	}

	async validate(data: string, signature: string, gate?: string) {
		const hashedTicket = this.ticketSigningService.decompress(data);

		const ticket = await this.db.ticket.findUnique({
			where: { code: signature },
			include: { event: true, ticketType: true },
		});

		if (!ticket) throw new NotFoundException('This ticket does not exist');

		if (ticket.status !== TicketStatus.ISSUED) {
			throw new UnauthorizedException(`Ticket not allowed: (${ticket.status})`);
		}

		if(ticket.orderId !== hashedTicket.orderId || ticket.eventId !== hashedTicket.eventId) throw new UnauthorizedException(`Ticket is not valid`);

		const valid = this.ticketSigningService.verifyHash(
			hashedTicket,
			signature,
		);
		if (!valid) throw new UnauthorizedException('Invalid signature');

		const event = ticket.event;
		if (!event) throw new NotFoundException('Event not found');
		if (event.status !== 'PUBLISHED') throw new UnauthorizedException('Event not active');

		const now = Date.now();
		const windowStart = new Date(event.startsAt).getTime() - 2 * 60 * 60 * 1000;
		const windowEnd = new Date(event.endsAt).getTime();
		if (now < windowStart || now > windowEnd) {
			throw new UnauthorizedException("It's not time yet");
		}

		const checkedInAt = new Date();

		await this.db.$transaction(async (tx) => {
			const { count } = await tx.ticket.updateMany({
				where: { id: ticket.id, status: TicketStatus.ISSUED },
				data: { status: TicketStatus.USED, usedAt: checkedInAt },
			});

			if (count === 0) {
				throw new ConflictException('Ticket was already checked in');
			}

			await tx.checkIn.create({
				data: { ticketId: ticket.id, eventId: ticket.eventId, gate },
			});
		});

		return {
			valid: true,
			ticketType: ticket.ticketType?.name,
			holderName: ticket.holderName,
			event: event.name,
			checkedInAt: checkedInAt.toISOString(),
		};
	}

	validSignature(data: string, signature: string): { valid: boolean } {
		try {
			const ticketHash = this.ticketSigningService.decompress(data);
			return { valid: this.ticketSigningService.verifyHash(ticketHash, signature) };
		} catch {

			return { valid: false };
		}
	}

	findAll(eventId: string) {
		return this.db.ticket.findMany({ where: { eventId } });
	}

	async cancel(id: string) {
		return this.transitionOnlyIfIssued(id, TicketStatus.CANCELLED);
	}

	async refund(id: string) {
		return this.transitionOnlyIfIssued(id, TicketStatus.REFUNDED);
	}

	private async transitionOnlyIfIssued(id: string, status: TicketStatus) {
		const { count } = await this.db.ticket.updateMany({
			where: { id, status: TicketStatus.ISSUED },
			data: { status },
		});

		if (count === 0) {
			const ticket = await this.db.ticket.findUnique({ where: { id } });
			if (!ticket) throw new NotFoundException('This ticket does not exist');
			throw new UnauthorizedException(`Ticket not allowed (${ticket.status})`);
		}

		return this.db.ticket.findUnique({ where: { id } });
	}

	holder(ticketId: string, holder: { name?: string; email?: string }) {
		return this.db.ticket.update({
			where: { id: ticketId },
			data: { holderName: holder.name, holderEmail: holder.email },
		});
	}

	field(ticketId: string, fields: FieldValue[]) {
		return this.db.ticket.update({
			where: { id: ticketId },
			data: { customFieldValues: fields },
		});
	}

	async url(id: string) {
		const ticket = await this.db.ticket.findUnique({
			where: { id: id },
		});
		if (!ticket) throw new NotFoundException('Ticket Not Found');

		return `ticket://v${FORMAT_VERSION}/${ticket.payload}@${ticket.code}`;
	}	
}