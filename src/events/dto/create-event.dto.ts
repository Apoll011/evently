export class CreateEventDto {
  name: string;
  organizerId: string;
  description: string;
  bannerImage?: string;
  startsAt: Date;
  endsAt: Date;
  location?: string;
  onlineUrl?: string;
  status: eventStatus;
  capacity?: number;
}

export type eventStatus = 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'FINISHED';
