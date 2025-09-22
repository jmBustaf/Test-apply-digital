import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { TrimEmptyToUndefined } from '../../common/decorators/trim-empty-to-undefined.decorator';
import { PaginationDto } from './pagination.dto';

export class ByCategoryDto extends PaginationDto {
  @TrimEmptyToUndefined()
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  category!: string;
}
