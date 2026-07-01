export class CreateOrderDto {
	eventId: string;
	buyerName?: string;
	buyerEmail?: string;
	paymentMethod: paymentType;
	items: CreateOrderItem[];
}

export type paymentType = 'STRIPE' | 'CASH';

export class CreateOrderItem {
	ticketTypeId: string;
	quantity: number;
	customFields?: FieldValue[][];
}

export type FieldValue = {
	label: string;
	value: string;
};
