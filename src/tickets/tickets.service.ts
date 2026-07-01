import { Injectable } from '@nestjs/common';
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

  findAll() {
    return this.db.ticketType.findMany();
  }

  findOne(id: string) {
    return this.db.ticketType.findUnique({
      where: {
        id: id,
      },
    });
  }

  update(id: string, updateTicketDto: Prisma.TicketTypeUpdateInput) {
    return this.db.ticketType.update({
      where: {
        id: id,
      },
      data: updateTicketDto,
    });
  }

  remove(id: string) {
    return this.db.ticketType.delete({
      where: {
        id: id,
      },
    });
  }
}
