import {
	Controller,
	Get,
	Patch,
	Param,
	ParseUUIDPipe,
	Query,
	Body,
	Post,
} from '@nestjs/common';
import { TicketService } from './ticket.service';
import { FieldValue } from '../orders/dto/create-order.dto';

@Controller('ticket')
export class TicketController {
	constructor(private readonly ticketService: TicketService) {}

	//TODO: Add a auth to this
	//Reader will reade a qrcode with ticket://version/ticketData@signature
	@Post('checkIn')
	validate(@Query('o') data: string, @Query('s') signature: string, @Query('gate') gate?: string) {
		return this.ticketService.validate(data, signature, gate);
	}

	@Get('v')
	quickValidate(@Query('o') data: string, @Query('s') signature: string) {
		return this.ticketService.validSignature(data, signature);
	}


	@Get(':id/url')
	url(@Param('id', ParseUUIDPipe) id: string) {
		return this.ticketService.url(id);
	}

	@Get(':id')
	findOne(@Param('id') id: string) {
		return this.ticketService.findOne(id);
	}

	@Patch(':id/cancel')
	cancel(@Param('id', ParseUUIDPipe) id: string) {
		return this.ticketService.cancel(id);
	}

	@Patch(':id/refund')
	refund(@Param('id', ParseUUIDPipe) id: string) {
		return this.ticketService.refund(id);
	}

	@Patch(':id/holder')
	holder(
		@Param('id', ParseUUIDPipe) id: string,
		@Body() holder: { name?: string; email?: string },
	) {
		return this.ticketService.holder(id, holder);
	}

	@Patch(':id/fields')
	fields(
		@Param('id', ParseUUIDPipe) id: string,
		@Body() fields: FieldValue[],
	) {
		return this.ticketService.field(id, fields);
	}
}
