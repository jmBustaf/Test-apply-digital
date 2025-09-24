import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContentfulModule } from './contentful.module';
import { ContentfulSyncService } from './contentful.sync.service';
import { ContentfulSyncController } from './contentful.controller';
import { Product } from 'src/products/entities/product.entity';

@Module({
  imports: [ContentfulModule, TypeOrmModule.forFeature([Product])],
  controllers: [ContentfulSyncController],
  providers: [ContentfulSyncService],
  exports: [ContentfulSyncService],
})
export class ContentfulFeatureModule {}
