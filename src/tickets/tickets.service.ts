import {
  Injectable,
  NotFoundException,
  PreconditionFailedException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DbService } from '../db/db.service';

@Injectable()
export class TicketsService {
  constructor(private db: DbService) {}

  create(createTicketDto: Prisma.TicketTypeCreateInput) {
    return this.db.ticketType.create({
      data: createTicketDto,
    });
  }

  findAll(eventId: string) {
    return this.db.ticketType.findMany({
      where: {
        eventId: eventId,
      },
    });
  }

  findOne(eventId: string, id: string) {
    return this.db.ticketType.findUnique({
      where: {
        id: id,
        eventId: eventId,
      },
    });
  }

  update(
    eventId: string,
    id: string,
    updateTicketDto: Prisma.TicketTypeUpdateInput,
  ) {
    return this.db.ticketType.update({
      where: {
        id: id,
        eventId: eventId,
      },
      data: updateTicketDto,
    });
  }

  async remove(eventId: string, id: string, force: boolean) {
    const ticket = await this.db.ticketType.findUnique({
      where: {
        id: id,
        eventId: eventId,
      },
    });

    if (!ticket) {
      throw new NotFoundException(`Ticket with ID ${id} not found`);
    }

    if(force && ticket.sold >= 0) {
      throw new PreconditionFailedException(
        `Ticket with ID ${id} already has sales, and this remove is not forced.`,
      );
    }

    return this.db.ticketType.delete({
      where: {
        id: id,
        eventId: eventId,
      },
    });
  }
}
