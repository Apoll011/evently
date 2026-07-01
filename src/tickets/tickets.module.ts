import { Module } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { TicketsController } from './tickets.controller';
import { DbModule } from '../db/db.module';

@Module({
  imports: [DbModule],
  controllers: [TicketsController],
  providers: [TicketsService],
})
export class TicketsModule {}
