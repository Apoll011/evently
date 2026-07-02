import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ScannerLoginDto {
	@ApiProperty({ example: 'pairing_token_here' })
	@IsString()
	@IsNotEmpty()
	pairingToken: string;
}
