import { Injectable } from '@nestjs/common';
import { EventStatus, Prisma } from '@prisma/client';
import { DbService } from '../db/db.service';

@Injectable()
export class EventsService {
	constructor(private db: DbService) {}

	async create(createEventDto: Prisma.EventCreateInput) {
		return this.db.event.create({
			data: createEventDto,
		});
	}

	findAll(organizerId?: string, status?: EventStatus) {
		if (status || organizerId) {
			return this.db.event.findMany({
				where: {
					status: status,
					organizerId: organizerId,
				},
			});
		}
		return this.db.event.findMany();
	}

	findOne(id: string) {
		return this.db.event.findUnique({
			where: {
				id: id,
			},
		});
	}

	checkin(id: string) {
		return this.db.checkIn.findMany({
			where: {
				eventId: id,
			},
		});
	}

	update(id: string, updateEventDto: Prisma.EventUpdateInput) {
		return this.db.event.update({
			where: {
				id: id,
			},
			data: updateEventDto,
		});
	}

	remove(id: string) {
		return this.db.event.delete({
			where: {
				id: id,
			},
		});
	}

	pub(id: string) {
		return this.db.event.update({
			where: {
				id: id,
			},
			data: {
				status: EventStatus.PUBLISHED,
			},
		});
	}

	cancel(id: string) {
		return this.db.event.update({
			where: {
				id: id,
			},
			data: {
				status: EventStatus.CANCELLED,
			},
		});
	}

	async stat(id: string) {
		const [tickets, checkins, orderItems] = await Promise.all([
			this.db.ticket.count({ where: { eventId: id } }),
			this.db.checkIn.count({ where: { eventId: id } }),
			this.db.orderItem.findMany({
				where: { order: { eventId: id, paymentStatus: 'PAID' } },
				include: { ticketType: true },
			}),
		]);

		return {
			tickets_sold: tickets,
			checkins: checkins,
			orders: orderItems,
		};
	}
}
