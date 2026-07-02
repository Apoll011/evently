import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EventsModule } from './events/events.module';
import { TicketsModule } from './tickets/tickets.module';
import { DbModule } from './db/db.module';
import { OrdersModule } from './orders/orders.module';
import { TicketModule } from './ticket/ticket.module';
import { TicketSigningService } from './ticket-signing/ticket-signing.service';
import { TicketSigningModule } from './ticket-signing/ticket-signing.module';

@Module({
	imports: [
		EventsModule,
		TicketsModule,
		DbModule,
		OrdersModule,
		TicketModule,
		TicketSigningModule,
	],
	controllers: [AppController],
	providers: [AppService, TicketSigningService],
})
export class AppModule {}
