import { Injectable } from '@nestjs/common';
import { DbService } from '../../db/db.service';
import { AuthenticatedRequest } from '../../auth/auth.types';
import { OwnershipGuardBase } from './ownership.guard.base';

@Injectable()
export class EventOwnershipGuard extends OwnershipGuardBase {
	protected resourceName = 'Event';

	constructor(private readonly db: DbService) {
		super();
	}

	protected async resolveOwnerId(
		request: AuthenticatedRequest,
	): Promise<string | null> {
		const eventId = (request.params.eventId ?? request.params.id) as string;
		const event = await this.db.event.findUnique({
			where: { id: eventId },
			select: { organizerId: true },
		});
		return event?.organizerId ?? null;
	}
}
