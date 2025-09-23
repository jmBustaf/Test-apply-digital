import { Expose } from 'class-transformer';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AuthResponseDto {
  @ApiProperty({ description: 'Indica si el login fue exitoso.' })
  @IsBoolean()
  @Expose()
  logged!: boolean;

  @ApiPropertyOptional({ description: 'JWT emitido si logged=true.' })
  @IsOptional()
  @IsString()
  @Expose()
  token?: string;

  @ApiPropertyOptional({ description: 'Tiempo de expiración del token (ej: "3600s").' })
  @IsOptional()
  @IsString()
  @Expose()
  expiresIn?: string;
}
