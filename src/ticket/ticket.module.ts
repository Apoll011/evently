import { Module } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { TicketController } from './ticket.controller';
import { DbModule } from '../db/db.module';

@Module({
	imports: [DbModule],
	controllers: [TicketController],
	providers: [TicketService],
})
export class TicketModule {}
