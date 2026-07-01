import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { DbModule } from '../db/db.module';

@Module({
	imports: [DbModule],
	controllers: [OrdersController],
	providers: [OrdersService],
})
export class OrdersModule {}
