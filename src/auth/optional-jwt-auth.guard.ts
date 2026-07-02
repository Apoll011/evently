import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Like JwtAuthGuard, but never rejects the request. If a valid token is
 * present, `req.user` gets populated; otherwise the route runs unauthenticated.
 * Used for endpoints that show more to the owning organizer but are otherwise public
 * (e.g. viewing a single event).
 */
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
	handleRequest(err: any, user: any) {
		// Swallow auth errors instead of throwing — absence of a user is fine here.
		return user || undefined;
	}
}
