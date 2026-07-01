import {
	Controller,
	Get,
	Patch,
	Param,
	ParseUUIDPipe,
	Query,
} from '@nestjs/common';
import { TicketService } from './ticket.service';

@Controller('ticket')
export class TicketController {
	constructor(private readonly ticketService: TicketService) {}

	@Get(':id')
	findOne(@Param('id') id: string) {
		return this.ticketService.findOne(id);
	}

	@Get(':code/validate')
	validate(@Param('code') code: string, @Query('gate') gate?: string) {
		return this.ticketService.validate(code, gate);
	}

	@Get('event/:eventId')
	eventTickets(@Param('eventId', ParseUUIDPipe) eventId: string) {
		return this.ticketService.findAll(eventId);
	}

	@Patch(':id/cancel')
	cancel(@Param('id', ParseUUIDPipe) id: string) {
		return this.ticketService.cancel(id);
	}

	@Patch(':id/refund')
	refund(@Param('id', ParseUUIDPipe) id: string) {
		return this.ticketService.refund(id);
	}
}
