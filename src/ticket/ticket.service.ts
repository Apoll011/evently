import {
	Injectable,
	NotFoundException,
	UnauthorizedException,
} from '@nestjs/common';
import { DbService } from '../db/db.service';

@Injectable()
export class TicketService {
	constructor(private db: DbService) {}

	findOne(id: string) {
		return this.db.ticket.findUnique({
			where: {
				id: id,
			},
		});
	}

	async validate(code: string, gate?: string) {
		const ticket = await this.db.ticket.findUnique({
			where: {
				code: code,
			},
		});

		if (!ticket) throw new NotFoundException('This Ticket does not exist');

		if (ticket.status !== 'ISSUED')
			throw new UnauthorizedException(
				`Ticket not allowed: (${ticket.status})`,
			);

		const event = await this.db.event.findUnique({
			where: {
				id: ticket.eventId,
			},
		});

		if (!event) throw new NotFoundException('Event not Found');

		if (event.status !== 'PUBLISHED')
			throw new UnauthorizedException('Event not Active');

		const date = new Date();
		const start = new Date(event.startsAt);
		start.setHours(start.getHours() - 2);
		const end = new Date(event.endsAt);

		if (!(date >= start && date <= end))
			throw new UnauthorizedException('Its not the time yet');

		await this.db.ticket.update({
			where: {
				id: ticket.id,
				code: code,
			},
			data: {
				status: 'USED',
				usedAt: new Date().toISOString(),
			},
		});

		await this.db.checkIn.create({
			data: {
				ticketId: ticket.id,
				eventId: ticket.eventId,
				gate: gate,
			},
		});

		const ticketType = await this.db.ticketType.findUnique({
			where: { id: ticket.ticketTypeId },
		});

		return {
			valid: true,
			ticketType: ticketType?.name,
			holderName: ticket.holderName,
			event: event.name,
			checkedInAt: new Date().toISOString(),
		};
	}

	findAll(eventId: string) {
		return this.db.ticket.findMany({
			where: {
				eventId: eventId,
			},
		});
	}

	async cancel(id: string) {
		await this.ensureOnlyIssued(id);

		return this.db.ticket.update({
			where: {
				id: id,
			},
			data: {
				status: 'CANCELLED',
			},
		});
	}

	async refund(id: string) {
		await this.ensureOnlyIssued(id);

		return this.db.ticket.update({
			where: {
				id: id,
			},
			data: {
				status: 'REFUNDED',
			},
		});
	}

	async ensureOnlyIssued(id: string) {
		const ticket = await this.db.ticket.findUnique({
			where: {
				id: id,
			},
		});

		if (!ticket) throw new NotFoundException('This Ticket does not exist');
		if (ticket.status != 'ISSUED')
			throw new UnauthorizedException(
				`Ticket not allowed (${ticket.status})`,
			);
	}
}
