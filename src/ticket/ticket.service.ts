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
				gate: gate,
			},
		});
	}

	findAll(eventId: string) {
		return this.db.ticket.findMany({
			where: {
				eventId: eventId,
			},
		});
	}

	cancel(id: string) {
		return this.db.ticket.update({
			where: {
				id: id,
			},
			data: {
				status: 'CANCELLED',
			},
		});
	}

	refund(id: string) {
		return this.db.ticket.update({
			where: {
				id: id,
			},
			data: {
				status: 'REFUNDED',
			},
		});
	}
}
