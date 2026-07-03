import { Injectable } from '@nestjs/common';
import pkg from '../package.json';

@Injectable()
export class AppService {
	getHello() {
		return {
			name: 'evently',
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
