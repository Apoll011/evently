import {
	Controller,
	Get,
	Post,
	Body,
	Param,
	ParseUUIDPipe,
	NotImplementedException
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Controller('orders')
export class OrdersController {
	constructor(private readonly ordersService: OrdersService) {}

	@Post()
	create(@Body() createOrderDto: CreateOrderDto) {
		return this.ordersService.create(createOrderDto);
	}

	@Get(':id')
	findOne(@Param('id', ParseUUIDPipe) id: string) {
		return this.ordersService.findOne(id);
	}

	@Get('webhook/stripe')
	stripe() {
		return this.ordersService.stripePayment();
	}
}
