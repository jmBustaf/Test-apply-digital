import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  readonly userName!: string;

  @IsString()
  @MinLength(6)
  readonly password!: string;
}
