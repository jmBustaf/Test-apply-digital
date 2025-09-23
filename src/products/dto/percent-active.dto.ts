import { IsEnum, IsOptional } from 'class-validator';
import { TrimEmptyToUndefined } from '../../common/decorators/trim-empty-to-undefined.decorator';
import { IsYMD } from '../../common/validators/is-ymd.validator';
import { FromLteTo } from '../../common/validators/from-lte-to.validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum PriceFlag {
  WITH = 'with',
  WITHOUT = 'without',
  ANY = 'any',
}

export enum DateField {
  CREATED = 'created',
  UPDATED = 'updated',
}

export class PercentActiveDto {
  @ApiPropertyOptional({
    description: 'Filtro por precio',
    enum: PriceFlag,
    default: PriceFlag.ANY,
  })
  @IsOptional()
  @TrimEmptyToUndefined()
  @IsEnum(PriceFlag)
  hasPrice: PriceFlag = PriceFlag.ANY;

  @ApiPropertyOptional({
    description: 'Campo de fecha a usar',
    enum: DateField,
    default: DateField.UPDATED,
  })
  @IsOptional()
  @TrimEmptyToUndefined()
  @IsEnum(DateField)
  dateField: DateField = DateField.UPDATED;

  @ApiPropertyOptional({ description: 'Fecha inicio (YYYY-MM-DD)', example: '2025-09-01' })
  @IsOptional()
  @TrimEmptyToUndefined()
  @IsYMD({ message: '"from" debe ser YYYY-MM-DD' })
  from?: string;

  @ApiPropertyOptional({ description: 'Fecha fin (YYYY-MM-DD)', example: '2025-09-30' })
  @IsOptional()
  @TrimEmptyToUndefined()
  @IsYMD({ message: '"to" debe ser YYYY-MM-DD' })
  @FromLteTo('from', 'to', '"from" no puede ser mayor que "to"')
  to?: string;
}
