import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { User, Role } from './entities/user.entity';

export type LoginEnsureResult = {
  id: string;
  userName: string;
  role: Role;
  created: boolean;
};

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly config: ConfigService,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  async ensureForLogin(userName: string, plainPassword: string): Promise<LoginEnsureResult> {
    const existing = await this.userRepo
      .createQueryBuilder('u')
      .addSelect('u.password')
      .where('u.userName = :userName', { userName })
      .getOne();

    if (existing) {
      const withPwd = existing as User & { password: string };
      const ok = await bcrypt.compare(plainPassword, withPwd.password);
      if (!ok) {
        this.logger.warn(`Invalid password for userName: ${userName}`);
        throw new UnauthorizedException('Invalid credentials');
      }
      return {
        id: existing.id,
        userName: existing.userName,
        role: Role.USER,
        created: false,
      };
    }

    const rounds = this.config.get<number>('BCRYPT_SALT_ROUNDS', 10);
    const hashed = await bcrypt.hash(plainPassword, rounds);

    try {
      const entity = this.userRepo.create({
        userName,
        password: hashed,
        role: Role.USER,
      });
      const saved = await this.userRepo.save(entity);
      this.logger.log(`User created on first login: ${saved.userName} (id: ${saved.id})`);
      return { id: saved.id, userName: saved.userName, role: Role.USER, created: true };
    } catch (err: any) {
      if (err?.code === '23505' || err?.code === 'ER_DUP_ENTRY') {
        const now = await this.userRepo
          .createQueryBuilder('u')
          .addSelect('u.password')
          .where('u.userName = :userName', { userName })
          .getOne();
        if (!now) {
          throw new HttpException('User creation conflict', HttpStatus.CONFLICT);
        }
        const withPwd = now as User & { password: string };
        const ok = await bcrypt.compare(plainPassword, withPwd.password);
        if (!ok) throw new UnauthorizedException('Invalid credentials');
        return {
          id: now.id,
          userName: now.userName,
          role: Role.USER,
          created: false,
        };
      }
      throw err;
    }
  }
}
