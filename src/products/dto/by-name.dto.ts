import { IsNotEmpty, IsString } from 'class-validator';
import { TrimEmptyToUndefined } from '../../common/decorators/trim-empty-to-undefined.decorator';
import { PaginationDto } from './pagination.dto';
import { ApiProperty } from '@nestjs/swagger';

export class ByNameDto extends PaginationDto {
  @ApiProperty({ description: 'Nombre (ILIKE)', example: 'MacBook' })
  @TrimEmptyToUndefined()
  @IsString()
  @IsNotEmpty()
  name!: string;
}
