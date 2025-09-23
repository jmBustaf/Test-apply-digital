import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/login-response.dto';
import { IReponsesDefault } from 'config/response.interface';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() loginDto: LoginDto): Promise<IReponsesDefault<AuthResponseDto>> {
    return this.authService.login(loginDto);
  }
}
