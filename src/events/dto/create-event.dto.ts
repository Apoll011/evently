import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
	IsBoolean,
	IsDateString,
	IsInt,
	IsOptional,
	IsString,
	IsUrl,
	Min,
} from 'class-validator';

export class CreateEventDto {
	@ApiProperty({ example: 'Summer Music Festival' })
	@IsString()
	name: string;

	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	description?: string;

	@ApiPropertyOptional()
	@IsOptional()
	@IsUrl()
	bannerImage?: string;

	@ApiProperty({ example: '2026-08-01T18:00:00.000Z' })
	@IsDateString()
	startsAt: string;

	@ApiProperty({ example: '2026-08-01T23:00:00.000Z' })
	@IsDateString()
	endsAt: string;

	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	location?: string;

	@ApiPropertyOptional()
	@IsOptional()
	@IsUrl()
	onlineUrl?: string;

	@ApiPropertyOptional({ default: false })
	@IsOptional()
	@IsBoolean()
	requiresNamedTickets?: boolean;

	@ApiPropertyOptional({ default: 0, description: '0 means unlimited' })
	@IsOptional()
	@IsInt()
	@Min(0)
	capacity?: number;
}
