import { Injectable } from '@nestjs/common';
import { DbService } from '../../db/db.service';
import { AuthenticatedRequest } from '../../auth/auth.types';
import { OwnershipGuardBase } from './ownership.guard.base';

@Injectable()
export class TicketOwnershipGuard extends OwnershipGuardBase {
	protected resourceName = 'Ticket';

	constructor(private readonly db: DbService) {
		super();
	}

	protected async resolveOwnerId(
		request: AuthenticatedRequest,
	): Promise<string | null> {
		const ticket = await this.db.ticket.findUnique({
			where: { id: request.params.id as string },
			include: { event: { select: { organizerId: true } } },
		});
		return ticket?.event?.organizerId ?? null;
	}
}
