import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	ParseUUIDPipe,
	ParseBoolPipe,
	Query,
} from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { DbService } from '../db/db.service';
import { Prisma } from '@prisma/client';

@Controller('events/:eventId/ticket-types')
export class TicketsController {
	constructor(
		private readonly ticketsService: TicketsService,
		private db: DbService,
	) {}

	@Post()
	async create(
		@Param('eventId', ParseUUIDPipe) eventId: string,
		@Body() createTicketDto: CreateTicketDto,
	) {
		return this.ticketsService.create(eventId, createTicketDto);
	}

	@Get()
	findAll(@Param('eventId', ParseUUIDPipe) eventId: string) {
		return this.ticketsService.findAll(eventId);
	}

	@Get(':id')
	findOne(
		@Param('eventId', ParseUUIDPipe) eventId: string,
		@Param('id', ParseUUIDPipe) id: string,
	) {
		return this.ticketsService.findOne(eventId, id);
	}

	@Patch(':id')
	update(
		@Param('eventId', ParseUUIDPipe) eventId: string,
		@Param('id', ParseUUIDPipe) id: string,
		@Body() updateTicketDto: Prisma.TicketTypeUpdateInput,
	) {
		return this.ticketsService.update(eventId, id, updateTicketDto);
	}

	@Delete(':id')
	remove(
		@Param('eventId', ParseUUIDPipe) eventId: string,
		@Param('id', ParseUUIDPipe) id: string,
		@Query('force', ParseBoolPipe) force: boolean,
	) {
		return this.ticketsService.remove(eventId, id, force);
	}
}
