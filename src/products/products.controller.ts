import { Controller, Get, Query, Delete, Param, UseGuards } from '@nestjs/common';
import { ProductsService } from './products.service';
import { PriceRangeDto } from './dto/price-range.dto';
import { PercentActiveDto } from './dto/percent-active.dto';
import { ByNameDto } from './dto/by-name.dto';
import { ByCategoryDto } from './dto/by-category.dto';
import { JwtAuthGuard } from 'config/strategies/jwt-auth.guard';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get('by-name')
  getByName(@Query() dto: ByNameDto) {
    return this.productsService.findByName(dto);
  }

  @Get('by-category')
  getByCategory(@Query() dto: ByCategoryDto) {
    return this.productsService.findByCategory(dto);
  }

  @Get('by-price-range')
  getByPriceRange(@Query() dto: PriceRangeDto) {
    return this.productsService.findByPriceRange(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('percent-deleted')
  getPercentDeleted() {
    return this.productsService.getPercentDeleted();
  }

  @UseGuards(JwtAuthGuard)
  @Get('percent-active')
  getPercentActive(@Query() dto: PercentActiveDto) {
    return this.productsService.getPercentActive(dto);
  }

  //

  @Delete('sku/:sku')
  softDeleteBySku(@Param('sku') sku: string) {
    return this.productsService.softDeleteBySku(sku);
  }
}
