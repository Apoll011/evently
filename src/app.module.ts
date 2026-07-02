import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EventsModule } from './events/events.module';
import { TicketTypesModule } from './ticket-types/ticket-types.module';
import { DbModule } from './db/db.module';
import { OrdersModule } from './orders/orders.module';
import { TicketsModule } from './tickets/tickets.module';
import { TicketSigningService } from './ticket-signing/ticket-signing.service';
import { TicketSigningModule } from './ticket-signing/ticket-signing.module';
import { AuthModule } from './auth/auth.module';
import { GuardsModule } from './common/guards/guards.module';

@Module({
	imports: [
		AuthModule,
		EventsModule,
		TicketTypesModule,
		DbModule,
		OrdersModule,
		TicketsModule,
		TicketSigningModule,
		GuardsModule,
	],
	controllers: [AppController],
	providers: [AppService, TicketSigningService],
})
export class AppModule {}
