import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthController } from '../../../auth/auth.controller';
import { AuthService } from '../../../auth/auth.service';
import { UsersService } from '../../../users/users.service';
import { User } from '../../../users/entities/user.entity';
import { UserFactory } from '../../../test-utils/factories';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  beforeEach(async () => {
    const mockRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    const mockConfigService = {
      get: jest.fn().mockReturnValue('15m'),
    };

    const mockJwtService = {
      signAsync: jest.fn(),
    };

    const mockUsersService = {
      ensureForLogin: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should return login response', async () => {
      // Arrange
      const loginDto = UserFactory.createLoginDto();
      const expectedResponse = {
        statusCode: 200,
        message: 'Login successful',
        data: {
          logged: true,
          token: 'jwt-token',
          expiresIn: '15m',
        },
      };
      const loginSpy = jest.spyOn(service, 'login').mockResolvedValue(expectedResponse);

      // Act
      const result = await controller.login(loginDto);

      // Assert
      expect(result).toEqual(expectedResponse);
      expect(loginSpy).toHaveBeenCalledWith(loginDto);
    });

    it('should handle service errors', async () => {
      // Arrange
      const loginDto = UserFactory.createLoginDto();
      const loginSpy = jest.spyOn(service, 'login').mockRejectedValue(new Error('Service error'));

      // Act & Assert
      await expect(controller.login(loginDto)).rejects.toThrow('Service error');
      expect(loginSpy).toHaveBeenCalledWith(loginDto);
    });
  });
});
