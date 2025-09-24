import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { AppController } from './app.controller';
import { ScheduleModule } from '@nestjs/schedule';
import { DatabaseModule } from '../config/database.module';
import { ProductsModule } from './products/products.module';
import { ContentfulFeatureModule } from './integrations/contentful/contentful.feature.module';
import { ScheduleFeatureModule } from './integrations/schedule/schedule.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    DatabaseModule,
    ProductsModule,
    ContentfulFeatureModule,
    ScheduleFeatureModule,
    AuthModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
