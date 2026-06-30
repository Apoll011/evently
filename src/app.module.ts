import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EventsResolver } from './events/events.resolver';
import { EventsModule } from './events/events.module';

@Module({
  imports: [EventsModule],
  controllers: [AppController],
  providers: [AppService, EventsResolver],
})
export class AppModule {}
