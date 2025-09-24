import { ConflictException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { ConfigService } from '@nestjs/config';
import { Role, User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';

type UserForAuth = User & { password: string };

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly config: ConfigService,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async ensureForLogin(userName: string, plainPassword: string): Promise<User> {
    try {
      const existing = (await this.userRepository.findOne({
        where: { userName: userName },
        select: ['id', 'userName', 'role', 'password'],
      })) as UserForAuth | null;

      if (existing) {
        const ok = await bcrypt.compare(plainPassword, existing.password);
        if (!ok) throw new UnauthorizedException('Invalid credentials');
        const { password: _, ...safe } = existing;
        return safe as User;
      }

      const rounds = this.config.get<number>('BCRYPT_SALT_ROUNDS', 10);
      const hashed = await bcrypt.hash(plainPassword, rounds);

      const user = await this.createUser({
        userName,
        password: hashed,
        role: Role.USER,
      });
      return user;
    } catch (err) {
      const dbErr = err as { code?: string; driverError?: { code?: string } };
      const code: string | undefined = dbErr.code ?? dbErr.driverError?.code;
      if (code !== '23505') throw err;

      const now = (await this.userRepository.findOne({
        where: { userName: userName },
        select: ['id', 'userName', 'role', 'password'],
      })) as UserForAuth | null;

      if (!now) throw new ConflictException('User creation conflict');

      const ok = await bcrypt.compare(plainPassword, now.password);
      if (!ok) throw new UnauthorizedException('Invalid credentials');

      const { password: _, ...safe } = now;
      return safe as User;
    }
  }

  private async createUser(createUserDto: CreateUserDto): Promise<User> {
    try {
      const entity = this.userRepository.create(createUserDto);
      const saved = await this.userRepository.save(entity);
      this.logger.log(`User created: ${saved.userName} (id: ${saved.id})`);
      return saved;
    } catch (err) {
      if (err instanceof QueryFailedError) {
        this.logger.error(`DB error creating user: ${err.message}`);
      }
      throw err;
    }
  }
}
