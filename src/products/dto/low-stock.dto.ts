import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from './pagination.dto';
import { TrimEmptyToUndefined } from '../../common/decorators/trim-empty-to-undefined.decorator';
import { ToInt } from '../../common/decorators/to-int.decorator';

export class LowStockDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Categoría (ILIKE)', example: 'laptops', minLength: 1 })
  @TrimEmptyToUndefined()
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Umbral de stock (<= incluye)', default: 20, minimum: 0 })
  @IsOptional()
  @ToInt(20)
  @IsInt()
  @Min(0)
  threshold = 20;
}
