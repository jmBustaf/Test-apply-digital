import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService, LoginEnsureResult } from 'src/users/users.service';
import { JwtPayload } from 'src/interfaces/models.interface';
import { IReponsesDefault } from 'config/response.interface';
import { AuthResponseDto } from './dto/login-response.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async login(loginDto: LoginDto): Promise<IReponsesDefault<AuthResponseDto>> {
    try {
      const { userName, password } = loginDto;
      const normalized = userName.trim().toLowerCase();
      const {
        id,
        userName: name,
        role,
      }: LoginEnsureResult = await this.users.ensureForLogin(normalized, password);

      const payload: JwtPayload = { sub: id, userName: name, role };

      const token = String(await this.jwt.signAsync(payload));
      const expiresIn = this.config.get<string>('JWT_EXPIRES_IN', '15m');

      this.logger.log(`User ${normalized} logged in`);
      return {
        statusCode: HttpStatus.OK,
        message: 'Login successful',
        data: { logged: true, token, expiresIn },
      };
    } catch (e: unknown) {
      if (e instanceof HttpException) throw e;
      const err = e as Error;
      this.logger.error(`AuthService.login error: ${err.message}`, err.stack);
      throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
