import { Injectable } from '@nestjs/common';
import { TicketSigningService } from '../../ticket-signing/ticket-signing.service';
import { DbService } from '../../db/db.service';
import { AuthenticatedRequest } from '../../auth/auth.types';
import { OwnershipGuardBase } from './ownership.guard.base';

/**
 * Check-in doesn't have an :id param — the ticket is identified by the QR
 * payload (`?o=`) itself. The payload isn't encrypted, just encoded, so we
 * can pull the eventId out of it without touching the DB or the ticket's
 * signature, then confirm the calling organizer owns that event.
 * The service layer still re-verifies the signature before actually
 * checking anyone in — this guard only gates *who's allowed to try*.
 */
@Injectable()
export class CheckInOwnershipGuard extends OwnershipGuardBase {
	protected resourceName = 'Event';

	constructor(
		private readonly db: DbService,
		private readonly ticketSigningService: TicketSigningService,
	) {
		super();
	}

	protected async resolveOwnerId(
		request: AuthenticatedRequest,
	): Promise<string | null> {
		const data = request.query.o;
		if (typeof data !== 'string') return null;

		let eventId: string;
		try {
			eventId = this.ticketSigningService.decompress(data).eventId;
		} catch {
			return null;
		}

		const event = await this.db.event.findUnique({
			where: { id: eventId },
			select: { organizerId: true },
		});
		return event?.organizerId ?? null;
	}
}
