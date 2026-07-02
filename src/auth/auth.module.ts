import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { DbModule } from '../db/db.module';
import { ScannerJwtStrategy } from './jwt.strategy-scanner';
import type { StringValue } from 'ms';

@Module({
	imports: [
		DbModule,
		PassportModule,
		JwtModule.register({
			secret: process.env.JWT_SECRET,
			signOptions: {
				expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as StringValue,
			},
		}),
	],
	controllers: [AuthController],
	providers: [AuthService, JwtStrategy, ScannerJwtStrategy],
	exports: [JwtModule, PassportModule],
})
export class AuthModule {}
