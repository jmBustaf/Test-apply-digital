import { IsInt, Min, IsOptional } from 'class-validator';
import { ToInt } from '../../common/decorators/to-int.decorator';

export class PaginationDto {
  @IsOptional()
  @ToInt(1)
  @IsInt()
  @Min(1)
  page = 1;

  @IsOptional()
  @ToInt(5)
  @IsInt()
  @Min(1)
  limit = 5;
}
