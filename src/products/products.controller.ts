import {
  Controller,
  Get,
  Query,
  Delete,
  Param,
  DefaultValuePipe,
  ParseIntPipe,
  ValidationPipe,
  UsePipes,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { PriceRangeDto } from './dto/price-range.dto';
import { PercentActiveDto } from './dto/percent-active.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get('by-name')
  getByName(
    @Query('name') name: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(5), ParseIntPipe) limit: number,
  ) {
    return this.productsService.findByName({ name, page, limit });
  }

  @Get('by-category')
  getByCategory(
    @Query('category') category: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(5), ParseIntPipe) limit: number,
  ) {
    return this.productsService.findByCategory({ category, page, limit });
  }

  @Get('by-price-range')
  getByPriceRange(@Query() dto: PriceRangeDto) {
    return this.productsService.findByPriceRange({
      minPrice: dto.minPrice,
      maxPrice: dto.maxPrice,
      page: dto.page ?? 1,
      limit: dto.limit ?? 5,
    });
  }

  //
  @Get('percent-deleted')
  getPercentDeleted() {
    return this.productsService.getPercentDeleted();
  }

  //
  @Get('percent-active')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }))
  getPercentActive(@Query() dto: PercentActiveDto) {
    return this.productsService.getPercentActive(dto);
  }

  @Delete('sku/:sku')
  softDeleteBySku(@Param('sku') sku: string) {
    return this.productsService.softDeleteBySku(sku);
  }
}
