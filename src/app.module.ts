import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EventsModule } from './events/events.module';
import { TicketsModule } from './tickets/tickets.module';

@Module({
  imports: [EventsModule, TicketsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
