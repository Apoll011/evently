import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { DbModule } from '../db/db.module';
import { GuardsModule } from '../common/guards/guards.module';

@Module({
	imports: [DbModule, GuardsModule],
	controllers: [EventsController],
	providers: [EventsService],
})
export class EventsModule {}
