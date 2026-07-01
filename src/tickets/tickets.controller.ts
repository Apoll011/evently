import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  NotFoundException,
} from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { DbService } from '../db/db.service';
import { Prisma } from '@prisma/client';

@Controller('events/:eventId/tickets')
export class TicketsController {
  constructor(
    private readonly ticketsService: TicketsService,
    private db: DbService,
  ) {}

  @Post()
  async create(
    @Param('eventId') eventId: string,
    @Body() createTicketDto: CreateTicketDto,
  ) {
    const eventExists = await this.db.event.findUnique({
      where: { id: eventId },
    });

    if (!eventExists) {
      throw new NotFoundException(`Event with ID ${eventId} not found`);
    }
    return this.ticketsService.create({
      event: {
        connect: { id: eventId },
      },
      ...createTicketDto,
      customFields: createTicketDto.customFields
        ? JSON.parse(JSON.stringify(createTicketDto.customFields))
        : undefined,
    });
  }

  @Get()
  findAll() {
    return this.ticketsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ticketsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTicketDto: Prisma.TicketTypeUpdateInput,
  ) {
    return this.ticketsService.update(id, updateTicketDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ticketsService.remove(id);
  }
}
