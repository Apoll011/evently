import { Module } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { TicketController } from './ticket.controller';
import { DbModule } from '../db/db.module';
import { TicketSigningModule } from '../ticket-signing/ticket-signing.module';

@Module({
	imports: [DbModule, TicketSigningModule],
	controllers: [TicketController],
	providers: [TicketService],
})
export class TicketModule {}
