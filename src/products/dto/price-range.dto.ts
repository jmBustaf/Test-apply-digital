import { IsNumber, IsOptional, Min } from 'class-validator';
import { ToNumber } from '../../common/decorators/to-number.decorator';
import { PaginationDto } from './pagination.dto';
import { MinLteMax } from '../../common/validators/min-lte-max.validator';

export class PriceRangeDto extends PaginationDto {
  @IsOptional()
  @ToNumber()
  @IsNumber()
  @Min(0, { message: '"minPrice" debe ser >= 0' })
  minPrice?: number;

  @IsOptional()
  @ToNumber()
  @IsNumber()
  @Min(0, { message: '"maxPrice" debe ser >= 0' })
  @MinLteMax('minPrice', 'maxPrice', '"minPrice" debe ser <= "maxPrice"')
  maxPrice?: number;
}
