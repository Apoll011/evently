import {
	Controller,
	Get,
	Patch,
	Param,
	ParseUUIDPipe,
	Query,
	Post,
	UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { TicketsService } from './tickets.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TicketOwnershipGuard } from '../common/guards/ticket-ownership.guard';
import { CheckInOwnershipGuard } from '../common/guards/check-in-ownership.guard';
import { ScannerAuthGuard } from '../auth/scanner-auth.guard';
import {CurrentScanner} from "../auth/current-scanner.decorator";
import {AuthenticatedScanner} from "../auth/auth.types";

@ApiTags('tickets')
@Controller('tickets')
export class TicketsController {
	constructor(private readonly ticketsService: TicketsService) {}

	// Scanner reads a QR encoding ticket://v{version}/{payload}@{code} and
	// posts the two halves back here. Requires the scanning organizer to own
	// the event the ticket belongs to.
	@Post('check-in')
	@ApiBearerAuth('BearerAuthScanner')
	@UseGuards(ScannerAuthGuard, CheckInOwnershipGuard)
	checkIn(
		@Query('o') data: string,
		@Query('s') signature: string,
		@Query('gate') gate?: string,
	) {
		return this.ticketsService.checkInSignature(data, signature, gate);
	}

	// t://A7K9X22a6
	@Post('code/check-in')
	@ApiBearerAuth('BearerAuthScanner')
	@UseGuards(ScannerAuthGuard, CheckInOwnershipGuard)
	checkInCode(
		@CurrentScanner() scanner: AuthenticatedScanner,
		@Query('code') code: string,
		@Query('gate') gate?: string,
	) {
		return this.ticketsService.checkInCode(scanner.eventId, code, gate);
	}

	// Read-only signature check — doesn't mutate anything, safe to leave public
	@Get('verify')
	verify(@Query('o') data: string, @Query('s') signature: string) {
		return this.ticketsService.verifySignature(data, signature);
	}

	@Get()
	findOneSigned(@Query('o') data: string, @Query('s') signature: string) {
		return this.ticketsService.findOneSigned(data, signature);
	}

	@ApiBearerAuth('BearerAuthScanner')
	@UseGuards(ScannerAuthGuard)
	@Get("/code")
	findOneCode(
		@CurrentScanner() scanner: AuthenticatedScanner,
		@Query('code') code: string
	) {
		return this.ticketsService.getFromCode(scanner.eventId, code);
	}


	@Get(':id/url')
	url(@Param('id', ParseUUIDPipe) id: string) {
		return this.ticketsService.url(id);
	}

	@Get(':id')
	findOne(@Param('id', ParseUUIDPipe) id: string) {
		return this.ticketsService.findOne(id);
	}

	@Patch(':id/cancel')
	@ApiBearerAuth('BearerAuth')
	@UseGuards(JwtAuthGuard, TicketOwnershipGuard)
	cancel(@Param('id', ParseUUIDPipe) id: string) {
		return this.ticketsService.cancel(id);
	}

	@Patch(':id/refund')
	@ApiBearerAuth('BearerAuth')
	@UseGuards(JwtAuthGuard, TicketOwnershipGuard)
	refund(@Param('id', ParseUUIDPipe) id: string) {
		return this.ticketsService.refund(id);
	}
}
