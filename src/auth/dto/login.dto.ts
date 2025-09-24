import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ description: 'Nombre de usuario', example: 'jose miguel' })
  @IsString()
  @IsNotEmpty()
  readonly userName!: string;

  @ApiProperty({
    description: 'Contraseña (mín. 6 caracteres)',
    minLength: 6,
    example: 'secret123',
  })
  @IsString()
  @MinLength(6)
  readonly password!: string;
}
