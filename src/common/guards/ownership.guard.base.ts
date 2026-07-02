import {
	CanActivate,
	ExecutionContext,
	ForbiddenException,
	NotFoundException,
} from '@nestjs/common';
import {
	AuthenticatedOrganizer,
	AuthenticatedRequest,
	AuthenticatedScanner,
} from '../../auth/auth.types';

/**
 * Shared skeleton for "does this organizer or scanner own the resource they're touching"
 * guards. Subclasses only need to say how to load the resource's organizerId or eventId.
 * Must run after JwtAuthGuard or ScannerAuthGuard (so `req.user` is populated).
 */
export abstract class OwnershipGuardBase implements CanActivate {
	/** Resolve the owner identity (organizerId or eventId) that owns the resource for this request, or null if the resource doesn't exist. */
	protected abstract resolveOwnerId(request: any): Promise<string | null>;

	/** Human-readable resource name used in the 404 message. */
	protected abstract resourceName: string;

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest();

		const user = request.user as
			AuthenticatedOrganizer | AuthenticatedScanner | undefined;

		if (!user) {
			// AuthGuard should have already rejected this — fail closed just in case.
			throw new ForbiddenException('Authentication required');
		}

		const ownerId = await this.resolveOwnerId(request);
		if (ownerId === null) {
			throw new NotFoundException(`${this.resourceName} not found`);
		}

		if ('organizerId' in user) {
			if (ownerId !== user.organizerId) {
				throw new ForbiddenException(
					`You don't have access to this ${this.resourceName.toLowerCase()}`,
				);
			}
		} else if ('eventId' in user) {
			// For scanners, the resolveOwnerId MUST return the eventId of the resource.
			if (ownerId !== user.eventId) {
				throw new ForbiddenException(
					`This scanner is not authorized for this event`,
				);
			}
		}

		return true;
	}
}
