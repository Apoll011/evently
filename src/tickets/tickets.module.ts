import { Module } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { TicketsController } from './tickets.controller';
import { DbModule } from '../db/db.module';
import { TicketSigningModule } from '../ticket-signing/ticket-signing.module';
import { GuardsModule } from '../common/guards/guards.module';

@Module({
	imports: [DbModule, TicketSigningModule, GuardsModule],
	controllers: [TicketsController],
	providers: [TicketsService],
})
export class TicketsModule {}
