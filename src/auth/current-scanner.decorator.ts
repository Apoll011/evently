import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import {
	AuthenticatedScanner,
	AuthenticatedScannerRequest,
} from './auth.types';

/**
 * Use on a route protected by ScannerAuthGuard to grab the
 * calling scanner, e.g. `checkIn(@CurrentScanner() scanner: AuthenticatedScanner)`.
 */
export const CurrentScanner = createParamDecorator(
	(
		_data: unknown,
		ctx: ExecutionContext,
	): AuthenticatedScanner | undefined => {
		const request = ctx
			.switchToHttp()
			.getRequest<AuthenticatedScannerRequest>();
		return request.user;
	},
);
