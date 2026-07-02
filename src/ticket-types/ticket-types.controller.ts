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
	DefaultValuePipe,
	Query,
	UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { TicketTypesService } from './ticket-types.service';
import { CreateTicketTypeDto } from './dto/create-ticket-type.dto';
import { UpdateTicketTypeDto } from './dto/update-ticket-type.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { EventOwnershipGuard } from '../common/guards/event-ownership.guard';

@ApiTags('ticket-types')
@Controller('events/:eventId/ticket-types')
export class TicketTypesController {
	constructor(private readonly ticketTypesService: TicketTypesService) {}

	@Post()
	@ApiBearerAuth('BearerAuth')
	@UseGuards(JwtAuthGuard, EventOwnershipGuard)
	create(
		@Param('eventId', ParseUUIDPipe) eventId: string,
		@Body() dto: CreateTicketTypeDto,
	) {
		return this.ticketTypesService.create(eventId, dto);
	}

	@Get()
	findAll(@Param('eventId', ParseUUIDPipe) eventId: string) {
		return this.ticketTypesService.findAll(eventId);
	}

	@Get(':id')
	findOne(
		@Param('eventId', ParseUUIDPipe) eventId: string,
		@Param('id', ParseUUIDPipe) id: string,
	) {
		return this.ticketTypesService.findOne(eventId, id);
	}

	@Patch(':id')
	@ApiBearerAuth('BearerAuth')
	@UseGuards(JwtAuthGuard, EventOwnershipGuard)
	update(
		@Param('eventId', ParseUUIDPipe) eventId: string,
		@Param('id', ParseUUIDPipe) id: string,
		@Body() dto: UpdateTicketTypeDto,
	) {
		return this.ticketTypesService.update(eventId, id, dto);
	}

	@Delete(':id')
	@ApiBearerAuth('BearerAuth')
	@UseGuards(JwtAuthGuard, EventOwnershipGuard)
	remove(
		@Param('eventId', ParseUUIDPipe) eventId: string,
		@Param('id', ParseUUIDPipe) id: string,
		@Query('force', new DefaultValuePipe(false), ParseBoolPipe) force: boolean,
	) {
		return this.ticketTypesService.remove(eventId, id, force);
	}
}
