import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
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

  @Get(':id/stat')
  stat(@Param('id') id: string) {
    return this.eventsService.stat(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateEventDto: Prisma.EventUpdateInput,
  ) {
    return this.eventsService.update(id, updateEventDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.eventsService.remove(id);
  }
}
