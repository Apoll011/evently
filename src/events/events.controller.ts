import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	Query,
	ParseUUIDPipe,
	UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { EventsService } from './events.service';
import { EventStatus } from '@prisma/client';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';
import { EventOwnershipGuard } from '../common/guards/event-ownership.guard';
import { CurrentOrganizer } from '../auth/current-organizer.decorator';
import type { AuthenticatedOrganizer } from '../auth/auth.types';

@ApiTags('events')
@Controller('events')
export class EventsController {
	constructor(private readonly eventsService: EventsService) {}

	@Post()
	@ApiBearerAuth('BearerAuth')
	@UseGuards(JwtAuthGuard)
	create(
		@CurrentOrganizer() organizer: AuthenticatedOrganizer,
		@Body() createEventDto: CreateEventDto,
	) {
		return this.eventsService.create(organizer.organizerId, createEventDto);
	}

	/** The authenticated organizer's own events, any status. */
	@Get()
	@ApiBearerAuth('BearerAuth')
	@UseGuards(JwtAuthGuard)
	findMine(
		@CurrentOrganizer() organizer: AuthenticatedOrganizer,
		@Query('status') status?: EventStatus,
	) {
		return this.eventsService.findAllForOrganizer(organizer.organizerId, status);
	}

	/** Public discovery — published events only. */
	@Get('public')
	findPublic(@Query('organizerId') organizerId?: string) {
		return this.eventsService.findPublished(organizerId);
	}

	@Get(':id/tickets')
	@ApiBearerAuth('BearerAuth')
	@UseGuards(JwtAuthGuard, EventOwnershipGuard)
	eventTickets(@Param('id', ParseUUIDPipe) id: string) {
		return this.eventsService.findAllTickets(id);
	}

	@Get(':id/orders')
	@ApiBearerAuth('BearerAuth')
	@UseGuards(JwtAuthGuard, EventOwnershipGuard)
	eventOrders(@Param('id', ParseUUIDPipe) id: string) {
		return this.eventsService.findAllOrders(id);
	}

	@Get(':id/stats')
	@ApiBearerAuth('BearerAuth')
	@UseGuards(JwtAuthGuard, EventOwnershipGuard)
	stats(@Param('id', ParseUUIDPipe) id: string) {
		return this.eventsService.stats(id);
	}

	@Get(':id/check-ins')
	@ApiBearerAuth('BearerAuth')
	@UseGuards(JwtAuthGuard, EventOwnershipGuard)
	checkins(@Param('id', ParseUUIDPipe) id: string) {
		return this.eventsService.checkins(id);
	}

	@Patch(':id/publish')
	@ApiBearerAuth('BearerAuth')
	@UseGuards(JwtAuthGuard, EventOwnershipGuard)
	pub(@Param('id', ParseUUIDPipe) id: string) {
		return this.eventsService.pub(id);
	}

	@Patch(':id/cancel')
	@ApiBearerAuth('BearerAuth')
	@UseGuards(JwtAuthGuard, EventOwnershipGuard)
	cancel(@Param('id', ParseUUIDPipe) id: string) {
		return this.eventsService.cancel(id);
	}

	/** Public event page — published events are visible to anyone, others only to their owner. */
	@Get(':id')
	@UseGuards(OptionalJwtAuthGuard)
	findOne(
		@Param('id', ParseUUIDPipe) id: string,
		@CurrentOrganizer() organizer?: AuthenticatedOrganizer,
	) {
		return this.eventsService.findOne(id, organizer?.organizerId);
	}

	@Patch(':id')
	@ApiBearerAuth('BearerAuth')
	@UseGuards(JwtAuthGuard, EventOwnershipGuard)
	update(
		@Param('id', ParseUUIDPipe) id: string,
		@Body() updateEventDto: UpdateEventDto,
	) {
		return this.eventsService.update(id, updateEventDto);
	}

	@Delete(':id')
	@ApiBearerAuth('BearerAuth')
	@UseGuards(JwtAuthGuard, EventOwnershipGuard)
	remove(@Param('id', ParseUUIDPipe) id: string) {
		return this.eventsService.remove(id);
	}
}
