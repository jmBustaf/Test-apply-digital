import { IsString, MinLength, MaxLength, IsEnum } from 'class-validator';
import { Role } from '../entities/user.entity';

export class CreateUserDto {
  @IsString()
  @MaxLength(50)
  userName!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsEnum(Role)
  role?: Role = Role.USER;
}
