import { IsNumber, IsOptional, Min } from 'class-validator';
import { ToNumber } from '../../common/decorators/to-number.decorator';
import { PaginationDto } from './pagination.dto';
import { MinLteMax } from '../../common/validators/min-lte-max.validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class PriceRangeDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Precio mínimo (>=0)', example: 1000 })
  @IsOptional()
  @ToNumber()
  @IsNumber()
  @Min(0, { message: '"minPrice" debe ser >= 0' })
  minPrice?: number;

  @ApiPropertyOptional({ description: 'Precio máximo (>=0)', example: 2500 })
  @IsOptional()
  @ToNumber()
  @IsNumber()
  @Min(0, { message: '"maxPrice" debe ser >= 0' })
  @MinLteMax('minPrice', 'maxPrice', '"minPrice" debe ser <= "maxPrice"')
  maxPrice?: number;
}
