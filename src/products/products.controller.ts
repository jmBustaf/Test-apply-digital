import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { ProductsService } from './products.service';

const PAGE_SIZE = 5;

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get('by-name')
  async getByName(@Query('name') name?: string, @Query('page') page?: string) {
    if (!name) throw new BadRequestException('El parámetro "name" es requerido');

    const p = this.parsePage(page);
    return this.productsService.findByName({
      name: name.trim(),
      page: p,
      limit: PAGE_SIZE,
    });
  }

  @Get('by-category')
  async getByCategory(@Query('category') category?: string, @Query('page') page?: string) {
    if (!category) throw new BadRequestException('El parámetro "category" es requerido');

    const p = this.parsePage(page);
    return this.productsService.findByCategory({
      category: category.trim(),
      page: p,
      limit: PAGE_SIZE,
    });
  }

  @Get('by-price-range')
  async getByPriceRange(
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('page') page?: string,
  ) {
    const min = this.parseNumber(minPrice, 'minPrice', 0);
    const max = this.parseNumber(maxPrice, 'maxPrice');

    if (min !== undefined && min < 0) throw new BadRequestException('"minPrice" debe ser >= 0');
    if (max !== undefined && max < 0) throw new BadRequestException('"maxPrice" debe ser >= 0');
    if (min !== undefined && max !== undefined && min > max) {
      throw new BadRequestException('"minPrice" debe ser <= "maxPrice"');
    }

    const p = this.parsePage(page);
    return this.productsService.findByPriceRange({
      minPrice: min,
      maxPrice: max,
      page: p,
      limit: PAGE_SIZE,
    });
  }

  private parsePage(page?: string): number {
    const p = Number(page ?? 1);
    return Number.isFinite(p) && p >= 1 ? Math.trunc(p) : 1;
  }

  private parseNumber(
    value: string | undefined,
    label: string,
    fallback?: number,
  ): number | undefined {
    if (value === undefined || value === null) return fallback;
    const n = Number(value);
    if (!Number.isFinite(n)) throw new BadRequestException(`"${label}" debe ser numérico`);
    return n;
  }
}
