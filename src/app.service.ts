import { Injectable } from '@nestjs/common';
import pkg from '../package.json';
import {TicketSigningService} from "./ticket-signing/ticket-signing.service";

@Injectable()
export class AppService {
	constructor(
		private readonly ticketSigningService: TicketSigningService,
	) {}

	getHello() {
		return {
			name: 'evently',
		};
	}

	async getKey() {
		return {
			algorithm: 'ed25519',
			keyId: this.ticketSigningService.id,
			public_key: this.ticketSigningService.pubKey
		};
	}

	getHealth() {
		return {
			status: 'healthy',
			timestamp: new Date().toISOString(),
			version: pkg.version,
		};
	}
}
