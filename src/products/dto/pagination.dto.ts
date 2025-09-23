import { IsInt, Min, IsOptional } from 'class-validator';
import { ToInt } from '../../common/decorators/to-int.decorator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class PaginationDto {
  @ApiPropertyOptional({ description: 'Página (>=1)', default: 1, minimum: 1 })
  @IsOptional()
  @ToInt(1)
  @IsInt()
  @Min(1)
  page = 1;

  @ApiPropertyOptional({ description: 'Ítems por página (>=1)', default: 5, minimum: 1 })
  @IsOptional()
  @ToInt(5)
  @IsInt()
  @Min(1)
  limit = 5;
}
