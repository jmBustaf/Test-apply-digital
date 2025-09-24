import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../../../auth/auth.service';
import { UsersService } from '../../../users/users.service';
import { LoginDto } from '../../../auth/dto/login.dto';
import { AuthResponseDto } from '../../../auth/dto/login-response.dto';
import {
  MockServiceFactory,
  TestAssertionHelpers,
  resetAllMocks,
  createMockLogger,
} from '../../../test-utils/helpers';
import { UserFactory } from '../../../test-utils/factories';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    resetAllMocks();

    usersService = {
      ensureForLogin: jest.fn(),
    } as any;

    jwtService = {
      signAsync: jest.fn(),
    } as any;

    configService = MockServiceFactory.createConfigService({
      JWT_EXPIRES_IN: '15m',
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: usersService,
        },
        {
          provide: JwtService,
          useValue: jwtService,
        },
        {
          provide: ConfigService,
          useValue: configService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    // Mock the logger
    (service as any).logger = createMockLogger();
  });

  describe('login', () => {
    const loginDto: LoginDto = UserFactory.createLoginDto();
    const user = UserFactory.create();
    const token = 'jwt-token';

    beforeEach(() => {
      usersService.ensureForLogin.mockClear();
      jwtService.signAsync.mockClear();
    });

    it('should return successful login response when credentials are valid', async () => {
      // Arrange
      usersService.ensureForLogin.mockResolvedValue(user);
      jwtService.signAsync.mockResolvedValue(token);

      // Act
      const result = await service.login(loginDto);

      // Assert
      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        message: 'Login successful',
        data: {
          logged: true,
          token,
          expiresIn: '15m',
        },
      });
      expect(usersService.ensureForLogin).toHaveBeenCalledWith(
        loginDto.userName.trim().toLowerCase(),
        loginDto.password,
      );
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        sub: user.id,
        userName: user.userName,
        role: user.role,
      });
    });

    it('should normalize username to lowercase and trim whitespace', async () => {
      // Arrange
      const loginDtoWithSpaces: LoginDto = {
        userName: '  TestUser  ',
        password: 'password',
      };
      usersService.ensureForLogin.mockResolvedValue(user);
      jwtService.signAsync.mockResolvedValue(token);

      // Act
      await service.login(loginDtoWithSpaces);

      // Assert
      expect(usersService.ensureForLogin).toHaveBeenCalledWith('testuser', 'password');
    });

    it('should use custom JWT expiration from config', async () => {
      // Arrange
      const customExpiration = '1h';
      configService.get.mockImplementation((key: string, defaultValue?: any) => {
        if (key === 'JWT_EXPIRES_IN') return customExpiration;
        return defaultValue;
      });
      usersService.ensureForLogin.mockResolvedValue(user);
      jwtService.signAsync.mockResolvedValue(token);

      // Act
      const result = await service.login(loginDto);

      // Assert
      expect(result.data.expiresIn).toBe(customExpiration);
    });

    it('should log successful login', async () => {
      // Arrange
      usersService.ensureForLogin.mockResolvedValue(user);
      jwtService.signAsync.mockResolvedValue(token);

      // Act
      await service.login(loginDto);

      // Assert
      expect((service as any).logger.log).toHaveBeenCalledWith('User testuser logged in');
    });

    it('should rethrow HttpException from UsersService', async () => {
      // Arrange
      const unauthorizedError = new UnauthorizedException('Invalid credentials');
      usersService.ensureForLogin.mockRejectedValue(unauthorizedError);

      // Act & Assert
      await TestAssertionHelpers.expectToThrowAsync(
        () => service.login(loginDto),
        unauthorizedError,
      );
    });

    it('should handle JWT signing errors and return internal server error', async () => {
      // Arrange
      usersService.ensureForLogin.mockResolvedValue(user);
      jwtService.signAsync.mockRejectedValue(new Error('JWT signing failed'));

      // Act & Assert
      await TestAssertionHelpers.expectToThrowAsync(
        () => service.login(loginDto),
        new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR),
      );
      expect((service as any).logger.error).toHaveBeenCalledWith(
        'AuthService.login error: JWT signing failed',
        expect.any(String),
      );
    });

    it('should handle unexpected errors and return internal server error', async () => {
      // Arrange
      const unexpectedError = new Error('Database connection failed');
      usersService.ensureForLogin.mockRejectedValue(unexpectedError);

      // Act & Assert
      await TestAssertionHelpers.expectToThrowAsync(
        () => service.login(loginDto),
        new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR),
      );
      expect((service as any).logger.error).toHaveBeenCalledWith(
        'AuthService.login error: Database connection failed',
        expect.any(String),
      );
    });

    it('should handle non-Error objects in catch block', async () => {
      // Arrange
      usersService.ensureForLogin.mockRejectedValue('String error');

      // Act & Assert
      await TestAssertionHelpers.expectToThrowAsync(
        () => service.login(loginDto),
        new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR),
      );
      expect((service as any).logger.error).toHaveBeenCalledWith(
        'AuthService.login error: undefined',
        undefined,
      );
    });

    it('should create correct JWT payload', async () => {
      // Arrange
      const userWithSpecificData = UserFactory.create({
        id: 'user-123',
        userName: 'testuser',
        role: 'user' as any,
      });
      usersService.ensureForLogin.mockResolvedValue(userWithSpecificData);
      jwtService.signAsync.mockResolvedValue(token);

      // Act
      await service.login(loginDto);

      // Assert
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        sub: 'user-123',
        userName: 'testuser',
        role: 'user',
      });
    });
  });
});
