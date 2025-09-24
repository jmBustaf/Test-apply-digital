import { IsNotEmpty, IsString } from 'class-validator';
import { TrimEmptyToUndefined } from '../../common/decorators/trim-empty-to-undefined.decorator';
import { PaginationDto } from './pagination.dto';

export class ByNameDto extends PaginationDto {
  @TrimEmptyToUndefined()
  @IsString()
  @IsNotEmpty()
  name!: string;
}
