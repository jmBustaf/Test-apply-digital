import { IsEnum, IsOptional } from 'class-validator';
import { TrimEmptyToUndefined } from '../../common/decorators/trim-empty-to-undefined.decorator';
import { IsYMD } from '../../common/validators/is-ymd.validator';
import { FromLteTo } from '../../common/validators/from-lte-to.validator'; // usa import relativo si no tienes paths

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
  @IsOptional()
  @TrimEmptyToUndefined()
  @IsEnum(PriceFlag)
  hasPrice: PriceFlag = PriceFlag.ANY;

  @IsOptional()
  @TrimEmptyToUndefined()
  @IsEnum(DateField)
  dateField: DateField = DateField.UPDATED;

  @IsOptional()
  @TrimEmptyToUndefined()
  @IsYMD({ message: '"from" debe ser YYYY-MM-DD' })
  from?: string;

  @IsOptional()
  @TrimEmptyToUndefined()
  @IsYMD({ message: '"to" debe ser YYYY-MM-DD' })
  @FromLteTo('from', 'to', '"from" no puede ser mayor que "to"')
  to?: string;
}
