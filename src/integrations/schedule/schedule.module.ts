import { Module } from '@nestjs/common';
import { ScheduleModule as NestScheduleModule } from '@nestjs/schedule';
import { ScheduleService } from './schedule.service';
import { ScheduleController } from './schedule.controller';
import { ContentfulFeatureModule } from '../contentful/contentful.feature.module';

@Module({
  imports: [NestScheduleModule, ContentfulFeatureModule],
  providers: [ScheduleService],
  controllers: [ScheduleController],
  exports: [ScheduleService],
})
export class ScheduleFeatureModule {}
