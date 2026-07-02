import { Module } from '@nestjs/common';
import { DbModule } from '../../db/db.module';
import { TicketSigningModule } from '../../ticket-signing/ticket-signing.module';
import { EventOwnershipGuard } from './event-ownership.guard';
import { TicketTypeOwnershipGuard } from './ticket-type-ownership.guard';
import { TicketOwnershipGuard } from './ticket-ownership.guard';
import { CheckInOwnershipGuard } from './check-in-ownership.guard';

@Module({
	imports: [DbModule, TicketSigningModule],
	providers: [
		EventOwnershipGuard,
		TicketTypeOwnershipGuard,
		TicketOwnershipGuard,
		CheckInOwnershipGuard,
	],
	exports: [
		EventOwnershipGuard,
		TicketTypeOwnershipGuard,
		TicketOwnershipGuard,
		CheckInOwnershipGuard,
	],
})
export class GuardsModule {}
