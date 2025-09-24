import { IsIn, IsOptional, Matches } from 'class-validator';
import { Transform } from 'class-transformer';

const EmptyStringToUndefined = () =>
  Transform(
    ({ value }: { value: unknown }): string | undefined => {
      if (value == null) return undefined;
      if (typeof value !== 'string') return undefined;
      const trimmed = value.trim();
      return trimmed === '' ? undefined : trimmed;
    },
    { toClassOnly: true },
  );

export class PercentActiveDto {
  @IsOptional()
  @EmptyStringToUndefined()
  @IsIn(['with', 'without', 'any'])
  hasPrice?: 'with' | 'without' | 'any';

  @IsOptional()
  @EmptyStringToUndefined()
  @IsIn(['created', 'updated'])
  dateField?: 'created' | 'updated';

  @IsOptional()
  @EmptyStringToUndefined()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  from?: string;

  @IsOptional()
  @EmptyStringToUndefined()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  to?: string;
}
