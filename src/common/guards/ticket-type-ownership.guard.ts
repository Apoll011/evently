import { Injectable } from '@nestjs/common';
import { DbService } from '../../db/db.service';
import { AuthenticatedRequest } from '../../auth/auth.types';
import { OwnershipGuardBase } from './ownership.guard.base';

/**
 * For routes nested under /events/:eventId/ticket-types/:id — used instead of
 * EventOwnershipGuard when we want to also confirm the ticket type itself
 * belongs to that event (not just that the organizer owns the event).
 */
@Injectable()
export class TicketTypeOwnershipGuard extends OwnershipGuardBase {
	protected resourceName = 'Ticket type';

	constructor(private readonly db: DbService) {
		super();
	}

	protected async resolveOwnerId(
		request: AuthenticatedRequest,
	): Promise<string | null> {
		const { eventId, id } = request.params;
		const ticketType = await this.db.ticketType.findFirst({
			where: { id, eventId },
			select: { event: { select: { organizerId: true } } },
		});
		return ticketType?.event.organizerId ?? null;
	}
}
