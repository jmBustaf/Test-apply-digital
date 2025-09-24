import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { TrimEmptyToUndefined } from '../../common/decorators/trim-empty-to-undefined.decorator';
import { PaginationDto } from './pagination.dto';
import { ApiProperty } from '@nestjs/swagger';

export class ByCategoryDto extends PaginationDto {
  @ApiProperty({ description: 'Categoría exacta para buscar', minLength: 1, example: 'laptops' })
  @TrimEmptyToUndefined()
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  category!: string;
}
