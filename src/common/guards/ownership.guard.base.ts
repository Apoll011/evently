import {
	CanActivate,
	ExecutionContext,
	ForbiddenException,
	NotFoundException,
} from '@nestjs/common';
import { AuthenticatedRequest } from '../../auth/auth.types';

/**
 * Shared skeleton for "does this organizer own the resource they're touching"
 * guards. Subclasses only need to say how to load the resource's organizerId.
 * Must run after JwtAuthGuard (so `req.user` is populated) — e.g.
 * `@UseGuards(JwtAuthGuard, EventOwnershipGuard)`.
 */
export abstract class OwnershipGuardBase implements CanActivate {
	/** Resolve the organizerId that owns the resource for this request, or null if the resource doesn't exist. */
	protected abstract resolveOwnerId(
		request: AuthenticatedRequest,
	): Promise<string | null>;

	/** Human-readable resource name used in the 404 message. */
	protected abstract resourceName: string;

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context
			.switchToHttp()
			.getRequest<AuthenticatedRequest>();

		if (!request.user) {
			// JwtAuthGuard should have already rejected this — fail closed just in case.
			throw new ForbiddenException('Authentication required');
		}

		const ownerId = await this.resolveOwnerId(request);
		if (ownerId === null) {
			throw new NotFoundException(`${this.resourceName} not found`);
		}

		if (ownerId !== request.user.organizerId) {
			throw new ForbiddenException(
				`You don't have access to this ${this.resourceName.toLowerCase()}`,
			);
		}

		return true;
	}
}
