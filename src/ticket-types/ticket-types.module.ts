import { Module } from '@nestjs/common';
import { TicketTypesService } from './ticket-types.service';
import { TicketTypesController } from './ticket-types.controller';
import { DbModule } from '../db/db.module';
import { GuardsModule } from '../common/guards/guards.module';

@Module({
	imports: [DbModule, GuardsModule],
	controllers: [TicketTypesController],
	providers: [TicketTypesService],
})
export class TicketTypesModule {}
