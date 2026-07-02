import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterOrganizerDto } from './dto/register-organizer.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { CurrentOrganizer } from './current-organizer.decorator';
import type { AuthenticatedOrganizer } from './auth.types';

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
}
