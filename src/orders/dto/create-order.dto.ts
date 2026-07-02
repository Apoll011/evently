import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
	ArrayMinSize,
	IsArray,
	IsEmail,
	IsIn,
	IsInt,
	IsOptional,
	IsString,
	IsUUID,
	Min,
	ValidateNested,
} from 'class-validator';

export type paymentType = 'STRIPE' | 'CASH' | 'OTHER';

export class FieldValue {
	@ApiProperty()
	@IsString()
	label: string;

	@ApiProperty()
	@IsString()
	value: string;
}

export class CreateOrderItem {
	@ApiProperty()
	@IsUUID()
	ticketTypeId: string;

	@ApiProperty({ example: 2 })
	@IsInt()
	@Min(1)
	quantity: number;

	@ApiPropertyOptional({
		type: [FieldValue],
		isArray: true,
		description:
			'One array of custom field answers per ticket in this line item.',
	})
	@IsOptional()
	@IsArray()
	customFields?: FieldValue[][];
}

export class CreateOrderDto {
	@ApiProperty()
	@IsUUID()
	eventId: string;

	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	buyerName?: string;

	@ApiPropertyOptional()
	@IsOptional()
	@IsEmail()
	buyerEmail?: string;

	@ApiProperty({ enum: ['STRIPE', 'CASH', 'OTHER'] })
	@IsIn(['STRIPE', 'CASH', 'OTHER'])
	paymentMethod: paymentType;

	@ApiProperty({ type: [CreateOrderItem] })
	@IsArray()
	@ArrayMinSize(1)
	@ValidateNested({ each: true })
	@Type(() => CreateOrderItem)
	items: CreateOrderItem[];
}
