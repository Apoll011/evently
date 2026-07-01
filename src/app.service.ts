import { Injectable } from '@nestjs/common';
import pkg from '../package.json';

@Injectable()
export class AppService {
	getHello(): string {
		return 'Hello World!';
	}

	getHealth() {
		return {
			status: 'healthy',
			timestamp: new Date().toISOString(),
			version: pkg.version,
		};
	}
}
