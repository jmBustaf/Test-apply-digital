import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContentfulModule } from './contentful.module';
import { ContentfulService } from './contentful.service';
import { ContentfulController } from './contentful.controller';
import { Product } from 'src/products/entities/product.entity';

@Module({
  imports: [ContentfulModule, TypeOrmModule.forFeature([Product])],
  controllers: [ContentfulController],
  providers: [ContentfulService],
  exports: [ContentfulService],
})
export class ContentfulFeatureModule {}
