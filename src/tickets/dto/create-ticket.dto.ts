export class CreateTicketDto {
  eventId: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  customFields?: CustomFieldDto[];
}

export class CustomFieldDto {
  label: string;
  type: 'text' | 'number' | 'email' | 'select' | 'checkbox';
  options?: string[];
}
