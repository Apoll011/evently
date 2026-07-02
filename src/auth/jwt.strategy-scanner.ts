import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtScannerSessionPayload, AuthenticatedScanner } from './auth.types';

@Injectable()
export class ScannerJwtStrategy extends PassportStrategy(Strategy, 'scanner') {
	constructor() {
		const secret = process.env.JWT_SECRET;
		if (!secret) {
			throw new Error(
				'JWT_SECRET is not set. Add it to your .env before starting the server.',
			);
		}

		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey: secret,
		});
	}

	validate(payload: JwtScannerSessionPayload): AuthenticatedScanner {
		if (!payload?.sub) {
			throw new UnauthorizedException('Invalid token');
		}
		return {
			scannerSessionId: payload.sub,
			eventId: payload.eventId,
		};
	}
}
