import {
	Injectable,
	NotFoundException,
	PreconditionFailedException,
} from '@nestjs/common';
import { DbService } from '../db/db.service';
import { CreateTicketTypeDto } from './dto/create-ticket-type.dto';
import { UpdateTicketTypeDto } from './dto/update-ticket-type.dto';

@Injectable()
export class TicketTypesService {
	constructor(private db: DbService) {}

	async create(eventId: string, dto: CreateTicketTypeDto) {
		const eventExists = await this.db.event.findUnique({
			where: { id: eventId },
		});

		if (!eventExists) {
			throw new NotFoundException(`Event with ID ${eventId} not found`);
		}

		return this.db.ticketType.create({
			data: {
				eventId,
				...dto,
				customFields: dto.customFields
					? JSON.parse(JSON.stringify(dto.customFields))
					: undefined,
			},
		});
	}

	findAll(eventId: string) {
		return this.db.ticketType.findMany({ where: { eventId } });
	}

	findOne(eventId: string, id: string) {
		return this.db.ticketType.findFirst({ where: { id, eventId } });
	}

	async update(eventId: string, id: string, dto: UpdateTicketTypeDto) {
		const existing = await this.db.ticketType.findFirst({
			where: { id, eventId },
		});
		if (!existing) {
			throw new NotFoundException(`Ticket type with ID ${id} not found`);
		}

		return this.db.ticketType.update({
			where: { id },
			data: {
				...dto,
				customFields: dto.customFields
					? JSON.parse(JSON.stringify(dto.customFields))
					: undefined,
			},
		});
	}

	async remove(eventId: string, id: string, force: boolean) {
		const ticketType = await this.db.ticketType.findFirst({
			where: { id, eventId },
		});

		if (!ticketType) {
			throw new NotFoundException(`Ticket type with ID ${id} not found`);
		}

		if (!force && ticketType.sold > 0) {
			throw new PreconditionFailedException(
				`Ticket type with ID ${id} already has sales, and this remove is not forced.`,
			);
		}

		return this.db.ticketType.delete({ where: { id } });
	}
}
