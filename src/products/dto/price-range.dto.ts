import { Transform } from 'class-transformer';
import { IsInt, IsNumber, IsOptional, Min } from 'class-validator';

export class PriceRangeDto {
  @Transform(({ value }) => (value === undefined ? undefined : Number(value)))
  @IsOptional()
  @IsNumber({}, { message: '"minPrice" debe ser numérico' })
  @Min(0, { message: '"minPrice" debe ser >= 0' })
  minPrice?: number;

  @Transform(({ value }) => (value === undefined ? undefined : Number(value)))
  @IsOptional()
  @IsNumber({}, { message: '"maxPrice" debe ser numérico' })
  @Min(0, { message: '"maxPrice" debe ser >= 0' })
  maxPrice?: number;

  @Transform(({ value }) => (value === undefined ? 1 : Number(value)))
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @Transform(({ value }) => (value === undefined ? 5 : Number(value)))
  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number;
}
