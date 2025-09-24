import { Transform } from 'class-transformer';
import { IsInt, Min, IsOptional } from 'class-validator';

export class PaginationDto {
  @Transform(({ value }) => (value === undefined ? 1 : Number(value)))
  @IsInt()
  @Min(1)
  @IsOptional()
  page = 1;

  @Transform(({ value }) => (value === undefined ? 5 : Number(value)))
  @IsInt()
  @Min(1)
  @IsOptional()
  limit = 5;
}
