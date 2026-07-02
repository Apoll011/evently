import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
	ArrayNotEmpty,
	IsArray,
	IsIn,
	IsInt,
	IsOptional,
	IsString,
	Min,
	ValidateNested,
} from 'class-validator';

export class CustomFieldDto {
	@ApiProperty()
	@IsString()
	label: string;

	@ApiProperty({ enum: ['text', 'number', 'email', 'select', 'checkbox'] })
	@IsIn(['text', 'number', 'email', 'select', 'checkbox'])
	type: 'text' | 'number' | 'email' | 'select' | 'checkbox';

	@ApiPropertyOptional({ type: [String] })
	@IsOptional()
	@IsArray()
	@IsString({ each: true })
	options?: string[];
}

export class CreateTicketTypeDto {
	@ApiProperty({ example: 'General Admission' })
	@IsString()
	name: string;

	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	description?: string;

	@ApiProperty({ example: 2500, description: 'Price in the smallest currency unit (e.g. cents)' })
	@IsInt()
	@Min(0)
	price: number;

	@ApiProperty({ example: 100 })
	@IsInt()
	@Min(1)
	quantity: number;

	@ApiPropertyOptional({ type: [CustomFieldDto] })
	@IsOptional()
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => CustomFieldDto)
	customFields?: CustomFieldDto[];
}
