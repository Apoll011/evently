import {
	Body,
	Controller,
	Get,
	ParseUUIDPipe,
	Post,
	Query,
	UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterOrganizerDto } from './dto/register-organizer.dto';
import { LoginDto } from './dto/login.dto';
import { ScannerLoginDto } from './dto/scanner-login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { CurrentOrganizer } from './current-organizer.decorator';
import type {
	AuthenticatedOrganizer,
	AuthenticatedScanner,
} from './auth.types';
import { CurrentScanner } from './current-scanner.decorator';
import { ScannerAuthGuard } from './scanner-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post('register')
	register(@Body() dto: RegisterOrganizerDto) {
		return this.authService.register(dto);
	}

	@Post('login')
	login(@Body() dto: LoginDto) {
		return this.authService.login(dto);
	}

	@Get('me')
	@ApiBearerAuth('BearerAuth')
	@UseGuards(JwtAuthGuard)
	me(@CurrentOrganizer() organizer: AuthenticatedOrganizer) {
		return this.authService.me(organizer.organizerId);
	}

	@Get('scanner')
	@ApiBearerAuth('BearerAuthScanner')
	@UseGuards(ScannerAuthGuard)
	scanner(@CurrentScanner() scanner: AuthenticatedScanner) {
		return this.authService.scanner(scanner.scannerSessionId);
	}

	@Get('create-scanner')
	@ApiBearerAuth('BearerAuth')
	@UseGuards(JwtAuthGuard)
	createScanner(
		@CurrentOrganizer() organizer: AuthenticatedOrganizer,
		@Query('eventId', ParseUUIDPipe) eventId: string,
	) {
		return this.authService.createScanner(organizer.organizerId, eventId);
	}

	@Post('scanner-login')
	loginScanner(@Body() dto: ScannerLoginDto) {
		return this.authService.scannerLogin(dto.pairingToken);
	}
}
