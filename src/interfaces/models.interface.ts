import { Role } from '../users/entities/user.entity';

export interface JwtPayload {
  sub: string;
  userName: string;
  role: Role;
}

export interface IPayload {
  userId: string;
  userName: string;
  role: Role;
}
