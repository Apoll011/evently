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

	stat(id: string) {
		return `This action returns a #${id} event stat`;
	}
}
