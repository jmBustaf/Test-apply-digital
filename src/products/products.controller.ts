import { Controller, Get, Query, Delete, Param, UseGuards } from '@nestjs/common';
import { ProductsService } from './products.service';
import { PriceRangeDto } from './dto/price-range.dto';
import { PercentActiveDto } from './dto/percent-active.dto';
import { ByNameDto } from './dto/by-name.dto';
import { ByCategoryDto } from './dto/by-category.dto';
import {
  ApiBearerAuth,
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  getSchemaPath,
  ApiExtraModels,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'config/strategies/jwt-auth.guard';
import { ProductDto } from './dto/product.dto';

@ApiTags('products')
@ApiExtraModels(ProductDto)
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get('by-name')
  @ApiOperation({ summary: 'Busca productos por nombre (ILIKE) con paginación' })
  @ApiQuery({ name: 'name', type: String, required: true, description: 'Fragmento de nombre' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiOkResponse({
    description: 'Listado paginado',
    schema: {
      type: 'object',
      properties: {
        ok: { type: 'boolean' },
        data: { type: 'array', items: { $ref: getSchemaPath(ProductDto) } },
        meta: {
          type: 'object',
          properties: {
            page: { type: 'number' },
            limit: { type: 'number' },
            totalItems: { type: 'number' },
            totalPages: { type: 'number' },
          },
        },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Parámetros inválidos' })
  getByName(@Query() dto: ByNameDto) {
    return this.productsService.findByName(dto);
  }

  @Get('by-category')
  @ApiOperation({ summary: 'Busca productos por categoría con paginación' })
  @ApiQuery({ name: 'category', type: String, required: true })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiOkResponse({
    description: 'Listado paginado',
    schema: {
      type: 'object',
      properties: {
        ok: { type: 'boolean' },
        data: { type: 'array', items: { $ref: getSchemaPath(ProductDto) } },
        meta: { $ref: '#/components/schemas/PaginatedMetaDto' },
      },
    },
  })
  getByCategory(@Query() dto: ByCategoryDto) {
    return this.productsService.findByCategory(dto);
  }

  @Get('by-price-range')
  @ApiOperation({ summary: 'Busca productos por rango de precios con paginación' })
  @ApiQuery({ name: 'minPrice', required: false, type: Number })
  @ApiQuery({ name: 'maxPrice', required: false, type: Number })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiOkResponse({
    description: 'Listado paginado',
    schema: {
      type: 'object',
      properties: {
        ok: { type: 'boolean' },
        data: { type: 'array', items: { $ref: getSchemaPath(ProductDto) } },
        meta: { $ref: '#/components/schemas/PaginatedMetaDto' },
      },
    },
  })
  getByPriceRange(@Query() dto: PriceRangeDto) {
    return this.productsService.findByPriceRange(dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Get('percent-deleted')
  @ApiOperation({ summary: 'Porcentaje de productos eliminados (privado)' })
  @ApiOkResponse({
    description: 'Porcentaje de eliminados',
    schema: {
      type: 'object',
      properties: {
        ok: { type: 'boolean' },
        data: {
          type: 'object',
          properties: { percentDeleted: { type: 'number', example: 12.5 } },
        },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Sin token o token inválido' })
  getPercentDeleted() {
    return this.productsService.getPercentDeleted();
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Get('percent-active')
  @ApiOperation({ summary: 'Porcentaje de activos con filtros (privado)' })
  @ApiQuery({ name: 'hasPrice', required: false, enum: ['with', 'without', 'any'] })
  @ApiQuery({ name: 'dateField', required: false, enum: ['created', 'updated'] })
  @ApiQuery({ name: 'from', required: false, type: String, example: '2025-09-01' })
  @ApiQuery({ name: 'to', required: false, type: String, example: '2025-09-30' })
  @ApiOkResponse({
    description: 'Porcentaje de activos',
    schema: {
      type: 'object',
      properties: {
        ok: { type: 'boolean' },
        data: {
          type: 'object',
          properties: { percentActive: { type: 'number', example: 87.5 } },
        },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Sin token o token inválido' })
  getPercentActive(@Query() dto: PercentActiveDto) {
    return this.productsService.getPercentActive(dto);
  }

  @Delete('sku/:sku')
  @ApiOperation({ summary: 'Soft-delete por SKU' })
  @ApiParam({ name: 'sku', description: 'SKU del producto', example: 'ABC-123' })
  @ApiOkResponse({ description: 'Producto marcado como eliminado' })
  @ApiBadRequestResponse({ description: 'SKU inválido o no encontrado' })
  softDeleteBySku(@Param('sku') sku: string) {
    return this.productsService.softDeleteBySku(sku);
  }
}
