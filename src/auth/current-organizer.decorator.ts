import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthenticatedOrganizer, AuthenticatedRequest } from './auth.types';

/**
 * Use on a route protected by JwtAuthGuard/OptionalJwtAuthGuard to grab the
 * calling organizer, e.g. `create(@CurrentOrganizer() organizer: AuthenticatedOrganizer)`.
 */
export const CurrentUser = createParamDecorator(
	(
		_data: unknown,
		ctx: ExecutionContext,
	): AuthenticatedOrganizer | undefined => {
		const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
		return request.user;
	},
);
