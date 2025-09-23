import { Expose } from 'class-transformer';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class AuthResponseDto {
  @IsBoolean()
  @Expose()
  logged!: boolean;

  @IsOptional()
  @IsString()
  @Expose()
  token?: string;

  @IsOptional()
  @IsString()
  @Expose()
  expiresIn?: string;
}
