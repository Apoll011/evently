import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { DbModule } from '../db/db.module';
import { TicketSigningModule } from '../ticket-signing/ticket-signing.module';

@Module({
	imports: [DbModule, TicketSigningModule],
	controllers: [OrdersController],
	providers: [OrdersService],
})
export class OrdersModule {}
