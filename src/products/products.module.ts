import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { Product } from './entities/product.entity';
import { JwtAuthGuard } from 'config/strategies/jwt-auth.guard';

@Module({
  imports: [TypeOrmModule.forFeature([Product])],
  controllers: [ProductsController],
  providers: [ProductsService, JwtAuthGuard],
  exports: [ProductsService],
})
export class ProductsModule {}
