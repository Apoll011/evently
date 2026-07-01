import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EventsModule } from './events/events.module';
import { TicketsModule } from './tickets/tickets.module';
import { DbModule } from './db/db.module';
import { OrdersModule } from './orders/orders.module';

@Module({
	imports: [EventsModule, TicketsModule, DbModule, OrdersModule],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
