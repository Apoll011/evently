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
} from '@nestjs/common';
import { EventsService } from './events.service';
import { EventStatus, Prisma } from '@prisma/client';

@Controller('events')
export class EventsController {
	constructor(private readonly eventsService: EventsService) {}

	@Post()
	create(@Body() createEventDto: Prisma.EventCreateInput) {
		return this.eventsService.create(createEventDto);
	}

	@Get()
	findAll(
		@Query('organizerId') organizerId?: string,
		@Query('status') status?: EventStatus,
	) {
		return this.eventsService.findAll(organizerId, status);
	}

	@Get('public')
	findPub(@Query('organizerId') organizerId?: string) {
		return this.eventsService.findAll(organizerId, 'PUBLISHED');
	}

	@Get(':id/stat')
	stat(@Param('id', ParseUUIDPipe) id: string) {
		return this.eventsService.stat(id);
	}

	@Get(':id/checkin')
	checkin(@Param('id', ParseUUIDPipe) id: string) {
		return this.eventsService.checkin(id);
	}

	@Patch(':id/publish')
	pub(@Param('id', ParseUUIDPipe) id: string) {
		return this.eventsService.pub(id);
	}

	@Patch(':id/cancel')
	cancel(@Param('id', ParseUUIDPipe) id: string) {
		return this.eventsService.cancel(id);
	}

	@Get(':id')
	findOne(@Param('id', ParseUUIDPipe) id: string) {
		return this.eventsService.findOne(id);
	}

	@Patch(':id')
	update(
		@Param('id', ParseUUIDPipe) id: string,
		@Body() updateEventDto: Prisma.EventUpdateInput,
	) {
		return this.eventsService.update(id, updateEventDto);
	}

	@Delete(':id')
	remove(@Param('id', ParseUUIDPipe) id: string) {
		return this.eventsService.remove(id);
	}
}
