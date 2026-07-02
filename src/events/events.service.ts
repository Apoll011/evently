import { Injectable, NotFoundException } from '@nestjs/common';
import { EventStatus } from '@prisma/client';
import { DbService } from '../db/db.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventsService {
	constructor(private db: DbService) {}

	create(organizerId: string, createEventDto: CreateEventDto) {
		return this.db.event.create({
			data: {
				...createEventDto,
				startsAt: new Date(createEventDto.startsAt),
				endsAt: new Date(createEventDto.endsAt),
				organizerId,
			},
		});
	}

	/** The authenticated organizer's own events (any status). */
	findAllForOrganizer(organizerId: string, status?: EventStatus) {
		return this.db.event.findMany({
			where: { organizerId, status },
			orderBy: { startsAt: 'asc' },
		});
	}

	/** Public listing — published events only, optionally scoped to one organizer's public page. */
	findPublished(organizerId?: string) {
		return this.db.event.findMany({
			where: { organizerId, status: EventStatus.PUBLISHED },
			orderBy: { startsAt: 'asc' },
		});
	}

	async findOne(id: string, requesterOrganizerId?: string) {
		const event = await this.db.event.findUnique({ where: { id } });
		if (!event)
			throw new NotFoundException(`Event with ID ${id} not found`);

		const isOwner = requesterOrganizerId === event.organizerId;
		if (event.status !== EventStatus.PUBLISHED && !isOwner) {
			// Don't reveal that an unpublished/foreign event exists.
			throw new NotFoundException(`Event with ID ${id} not found`);
		}

		return event;
	}

	findAllTickets(id: string) {
		return this.db.ticket.findMany({ where: { eventId: id } });
	}

	findAllOrders(id: string) {
		return this.db.order.findMany({
			where: { eventId: id },
			include: { items: true },
			orderBy: { createdAt: 'desc' },
		});
	}

	checkins(id: string) {
		return this.db.checkIn.findMany({ where: { eventId: id } });
	}

	update(id: string, updateEventDto: UpdateEventDto) {
		const { startsAt, endsAt, ...rest } = updateEventDto;
		return this.db.event.update({
			where: { id },
			data: {
				...rest,
				...(startsAt ? { startsAt: new Date(startsAt) } : {}),
				...(endsAt ? { endsAt: new Date(endsAt) } : {}),
			},
		});
	}

	remove(id: string) {
		return this.db.event.delete({ where: { id } });
	}

	pub(id: string) {
		return this.db.event.update({
			where: { id },
			data: { status: EventStatus.PUBLISHED },
		});
	}

	cancel(id: string) {
		return this.db.event.update({
			where: { id },
			data: { status: EventStatus.CANCELLED },
		});
	}

	async stats(id: string) {
		const [ticketsSold, checkinsCount, orderItems] = await Promise.all([
			this.db.ticket.count({ where: { eventId: id } }),
			this.db.checkIn.count({ where: { eventId: id } }),
			this.db.orderItem.findMany({
				where: { order: { eventId: id, paymentStatus: 'PAID' } },
				include: { ticketType: true },
			}),
		]);

		const revenue = orderItems.reduce(
			(acc, item) => acc + item.unitPrice * item.quantity,
			0,
		);

		return {
			ticketsSold,
			checkins: checkinsCount,
			revenue,
			orderItems,
		};
	}
}
