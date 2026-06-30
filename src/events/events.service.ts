import { Injectable } from '@nestjs/common';
import { CreateEventDto, type eventStatus } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventsService {
  create(createEventDto: CreateEventDto) {
    return 'This action adds a new event';
  }

  findAll(organizerId?: string, status?: eventStatus) {
    return `This action returns all events`;
  }

  findOne(id: number) {
    return `This action returns a #${id} event`;
  }

  update(id: number, updateEventDto: UpdateEventDto) {
    return `This action updates a #${id} event`;
  }

  remove(id: number) {
    return `This action removes a #${id} event`;
  }

  stat(id: number) {
    return `This action returns a #${id} event stat`;
  }
}
