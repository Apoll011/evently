import { Module } from '@nestjs/common';
import { TicketSigningService } from './ticket-signing.service';

@Module({
	providers: [TicketSigningService],
	exports: [TicketSigningService],
})
export class TicketSigningModule {}
