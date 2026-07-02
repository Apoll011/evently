import {
	ConflictException,
	Injectable,
	NotFoundException,
	UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { DbService } from '../db/db.service';
import { RegisterOrganizerDto } from './dto/register-organizer.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload, JwtScannerSessionPayload } from './auth.types';
import { createHash, randomBytes } from 'crypto';

const BCRYPT_SALT_ROUNDS = 12;

@Injectable()
export class AuthService {
	constructor(
		private readonly db: DbService,
		private readonly jwtService: JwtService,
	) {}

	async register(dto: RegisterOrganizerDto) {
		const existing = await this.db.organizer.findUnique({
			where: { email: dto.email },
		});
		if (existing) {
			throw new ConflictException(
				'An organizer with this email already exists',
			);
		}

		const passwordHash = await bcrypt.hash(
			dto.password,
			BCRYPT_SALT_ROUNDS,
		);

		const organizer = await this.db.organizer.create({
			data: {
				name: dto.name,
				email: dto.email,
				passwordHash,
			},
		});

		return this.buildAuthResponse(
			organizer.id,
			organizer.email,
			organizer.name,
		);
	}

	async login(dto: LoginDto) {
		const organizer = await this.db.organizer.findUnique({
			where: { email: dto.email },
		});

		// Same error for "no such organizer" and "wrong password" so we don't
		// leak which emails are registered.
		if (!organizer) {
			throw new UnauthorizedException('Invalid email or password');
		}

		const passwordMatches = await bcrypt.compare(
			dto.password,
			organizer.passwordHash,
		);
		if (!passwordMatches) {
			throw new UnauthorizedException('Invalid email or password');
		}

		return this.buildAuthResponse(
			organizer.id,
			organizer.email,
			organizer.name,
		);
	}

	me(organizerId: string) {
		return this.db.organizer.findUnique({
			where: { id: organizerId },
			select: { id: true, name: true, email: true, createdAt: true },
		});
	}

	scanner(sessionId: string) {
		return this.db.scannerSession.findUnique({
			where: { id: sessionId },
			select: { id: true, eventId: true, organizerId: true },
		});
	}

	async createScanner(organizerId: string, eventId: string) {
		const token = randomBytes(32).toString('hex');
		const tokenHash = createHash('sha256').update(token).digest('hex');
		await this.db.scannerSession.create({
			data: {
				eventId,
				organizerId,
				tokenHash,
				expiresAt: new Date(Date.now() + 15 * 60 * 1000),
			},
		});
		return {
			url: `ticket-scanner://${token}`,
		};
	}

	async scannerLogin(token: string) {
		const tokenHash = createHash('sha256').update(token).digest('hex');
		const existing = await this.db.scannerSession.findFirst({
			where: { tokenHash },
		});
		if (!existing) {
			throw new UnauthorizedException(`Invalid pairing token`);
		}

		if (Date.now() > existing.expiresAt.getDate()) {
			throw new UnauthorizedException('Session Expired');
		}

		if (existing.used) {
			throw new UnauthorizedException('Session Already Used');
		}

		await this.db.scannerSession.update({
			where: { id: existing.id },
			data: { used: true },
		});

		const payload: JwtScannerSessionPayload = {
			sub: existing.id,
			eventId: existing.eventId,
		};
		return {
			accessToken: this.jwtService.sign(payload),
		};
	}

	private buildAuthResponse(
		organizerId: string,
		email: string,
		name: string,
	) {
		const payload: JwtPayload = { sub: organizerId, email };
		return {
			accessToken: this.jwtService.sign(payload),
			organizer: { id: organizerId, email, name },
		};
	}
}
