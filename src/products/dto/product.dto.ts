import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProductDto {
  @ApiProperty({ format: 'uuid', readOnly: true, description: 'Identificador único del producto' })
  id!: string;

  @ApiPropertyOptional({
    description: 'ID del registro en Contentful (si aplica)',
    example: '3ZxS5MCw4W3R8rcN',
    nullable: true,
    readOnly: true,
  })
  contentful_id!: string | null;

  @ApiPropertyOptional({
    description: 'SKU único del producto',
    example: 'SKUABC013F',
    nullable: true,
    readOnly: true,
  })
  sku!: string | null;

  @ApiPropertyOptional({
    description: 'Nombre comercial del producto',
    example: 'MacBook Air 13"',
    nullable: true,
  })
  name!: string | null;

  @ApiPropertyOptional({
    description: 'Marca del producto',
    example: 'Apple',
    nullable: true,
  })
  brand!: string | null;

  @ApiPropertyOptional({
    description: 'Modelo o referencia del producto',
    example: 'M2 2023',
    nullable: true,
  })
  model!: string | null;

  @ApiPropertyOptional({
    description: 'Categoría a la que pertenece el producto',
    example: 'laptops',
    nullable: true,
  })
  category!: string | null;

  @ApiPropertyOptional({
    description: 'Color principal del producto',
    example: 'silver',
    nullable: true,
  })
  color!: string | null;

  @ApiPropertyOptional({
    description: 'Precio del producto expresado como string decimal',
    example: '1999.99',
    nullable: true,
  })
  price!: string | null;

  @ApiPropertyOptional({
    description: 'Código de moneda',
    example: 'USD',
    nullable: true,
  })
  currency!: string | null;

  @ApiProperty({
    description: 'Cantidad de unidades disponibles en inventario',
    example: 5,
  })
  stock!: number;

  @ApiProperty({
    description: 'Indica si el producto fue marcado como eliminado lógico',
    example: false,
  })
  isDeleted!: boolean;

  @ApiPropertyOptional({
    description: 'Fecha en que el producto fue marcado como eliminado (soft delete)',
    type: String,
    format: 'date-time',
    nullable: true,
    readOnly: true,
  })
  deletedAt!: Date | null;

  @ApiPropertyOptional({
    description: 'Fecha de creación del registro',
    type: String,
    format: 'date-time',
    nullable: true,
    readOnly: true,
  })
  createdAt!: Date | null;

  @ApiPropertyOptional({
    description: 'Última fecha de actualización del registro',
    type: String,
    format: 'date-time',
    nullable: true,
    readOnly: true,
  })
  updatedAt!: Date | null;
}
