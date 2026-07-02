import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload, AuthenticatedOrganizer } from './auth.types';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
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

	validate(payload: JwtPayload): AuthenticatedOrganizer {
		if (!payload?.sub) {
			throw new UnauthorizedException('Invalid token');
		}
		return { organizerId: payload.sub, email: payload.email };
	}
}
