import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { AppController } from './app.controller';
import { DatabaseModule } from 'config/database.module';
import { ProductsModule } from './products/products.module';
import { ContentfulFeatureModule } from './integrations/contentful/contentful.feature.module';

@Module({
  imports: [DatabaseModule, ProductsModule, ContentfulFeatureModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
