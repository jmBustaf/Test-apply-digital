import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../entities/user.entity';

export class UserDto {
  @ApiProperty({
    description: 'Identificador único del usuario',
    format: 'uuid',
    readOnly: true,
  })
  id!: string;

  @ApiProperty({
    description: 'Nombre de usuario único',
    example: 'jose',
  })
  userName!: string;

  @ApiProperty({
    description: 'Rol asignado al usuario',
    enum: Role,
    example: Role.USER,
  })
  role!: Role;

  @ApiProperty({
    description: 'Fecha de creación del registro de usuario',
    type: String,
    format: 'date-time',
    readOnly: true,
  })
  createdAt!: Date;
}
