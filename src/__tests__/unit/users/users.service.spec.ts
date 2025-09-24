import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, QueryFailedError } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../../../users/users.service';
import { User, Role } from '../../../users/entities/user.entity';
import { CreateUserDto } from '../../../users/dto/create-user.dto';
import {
  MockRepositoryFactory,
  MockServiceFactory,
  TestDatabaseHelpers,
  TestAssertionHelpers,
  resetAllMocks,
  createMockLogger,
} from '../../../test-utils/helpers';
import { UserFactory } from '../../../test-utils/factories';

// Mock bcrypt
jest.mock('bcryptjs');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: ReturnType<typeof MockRepositoryFactory.createUserRepository>;
  let configService: ReturnType<typeof MockServiceFactory.createConfigService>;

  beforeEach(async () => {
    resetAllMocks();

    userRepository = MockRepositoryFactory.createUserRepository();
    configService = MockServiceFactory.createConfigService({
      BCRYPT_SALT_ROUNDS: 10,
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: userRepository,
        },
        {
          provide: ConfigService,
          useValue: configService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    // Mock the logger
    (service as any).logger = createMockLogger();
  });

  describe('ensureForLogin', () => {
    const userName = 'testuser';
    const plainPassword = 'plainpassword';
    const hashedPassword = 'hashedpassword';

    beforeEach(() => {
      mockedBcrypt.compare.mockClear();
      mockedBcrypt.hash.mockClear();
    });

    describe('when user exists', () => {
      it('should return user when password is correct', async () => {
        // Arrange
        const existingUser = UserFactory.createWithPassword({
          userName,
          password: hashedPassword,
        });
        userRepository.findOne.mockResolvedValue(existingUser);
        mockedBcrypt.compare.mockResolvedValue(true as never);

        // Act
        const result = await service.ensureForLogin(userName, plainPassword);

        // Assert
        expect(result).toEqual({
          id: existingUser.id,
          userName: existingUser.userName,
          role: existingUser.role,
          createdAt: existingUser.createdAt,
        });
        expect(userRepository.findOne).toHaveBeenCalledWith({
          where: { userName },
          select: ['id', 'userName', 'role', 'password'],
        });
        expect(mockedBcrypt.compare).toHaveBeenCalledWith(plainPassword, hashedPassword);
      });

      it('should throw UnauthorizedException when password is incorrect', async () => {
        // Arrange
        const existingUser = UserFactory.createWithPassword({
          userName,
          password: hashedPassword,
        });
        userRepository.findOne.mockResolvedValue(existingUser);
        mockedBcrypt.compare.mockResolvedValue(false as never);

        // Act & Assert
        await TestAssertionHelpers.expectToThrowAsync(
          () => service.ensureForLogin(userName, plainPassword),
          new UnauthorizedException('Invalid credentials'),
        );
      });
    });

    describe('when user does not exist', () => {
      it('should create new user when no existing user found', async () => {
        // Arrange
        userRepository.findOne.mockResolvedValue(null);
        mockedBcrypt.hash.mockResolvedValue(hashedPassword as never);
        const newUser = UserFactory.create({ userName });
        userRepository.create.mockReturnValue(newUser as any);
        userRepository.save.mockResolvedValue(newUser as any);

        // Act
        const result = await service.ensureForLogin(userName, plainPassword);

        // Assert
        expect(result).toEqual(newUser);
        expect(mockedBcrypt.hash).toHaveBeenCalledWith(plainPassword, 10);
        expect(userRepository.create).toHaveBeenCalledWith({
          userName,
          password: hashedPassword,
          role: Role.USER,
        });
        expect(userRepository.save).toHaveBeenCalledWith(newUser);
      });

      it('should use config salt rounds for hashing', async () => {
        // Arrange
        const customSaltRounds = 12;
        configService.get.mockImplementation((key: string, defaultValue?: any) => {
          if (key === 'BCRYPT_SALT_ROUNDS') return customSaltRounds;
          return defaultValue;
        });
        userRepository.findOne.mockResolvedValue(null);
        mockedBcrypt.hash.mockResolvedValue(hashedPassword as never);
        const newUser = UserFactory.create({ userName });
        userRepository.create.mockReturnValue(newUser as any);
        userRepository.save.mockResolvedValue(newUser as any);

        // Act
        await service.ensureForLogin(userName, plainPassword);

        // Assert
        expect(mockedBcrypt.hash).toHaveBeenCalledWith(plainPassword, customSaltRounds);
      });
    });

    describe('when unique constraint violation occurs', () => {
      it('should handle race condition and return existing user when password is correct', async () => {
        // Arrange
        const uniqueError = new QueryFailedError('', [], '');
        (uniqueError as any).code = '23505';
        userRepository.save.mockRejectedValue(uniqueError);

        const existingUser = UserFactory.createWithPassword({
          userName,
          password: hashedPassword,
        });
        userRepository.findOne
          .mockResolvedValueOnce(null) // First call for initial check
          .mockResolvedValueOnce(existingUser); // Second call after unique constraint error
        mockedBcrypt.compare.mockResolvedValue(true as never);

        // Act
        const result = await service.ensureForLogin(userName, plainPassword);

        // Assert
        expect(result).toEqual({
          id: existingUser.id,
          userName: existingUser.userName,
          role: existingUser.role,
          createdAt: existingUser.createdAt,
        });
        expect(userRepository.findOne).toHaveBeenCalledTimes(2);
        expect(mockedBcrypt.compare).toHaveBeenCalledWith(plainPassword, hashedPassword);
      });

      it('should throw ConflictException when user not found after unique constraint error', async () => {
        // Arrange
        const uniqueError = new QueryFailedError('', [], '');
        (uniqueError as any).code = '23505';
        userRepository.save.mockRejectedValue(uniqueError);

        userRepository.findOne
          .mockResolvedValueOnce(null) // First call for initial check
          .mockResolvedValueOnce(null); // Second call after unique constraint error returns null

        // Act & Assert
        await TestAssertionHelpers.expectToThrowAsync(
          () => service.ensureForLogin(userName, plainPassword),
          new ConflictException('User creation conflict'),
        );
      });

      it('should throw UnauthorizedException when password is incorrect after unique constraint error', async () => {
        // Arrange
        const uniqueError = new QueryFailedError('', [], '');
        (uniqueError as any).code = '23505';
        userRepository.save.mockRejectedValue(uniqueError);

        const existingUser = UserFactory.createWithPassword({
          userName,
          password: hashedPassword,
        });
        userRepository.findOne
          .mockResolvedValueOnce(null) // First call for initial check
          .mockResolvedValueOnce(existingUser); // Second call after unique constraint error
        mockedBcrypt.compare.mockResolvedValue(false as never);

        // Act & Assert
        await TestAssertionHelpers.expectToThrowAsync(
          () => service.ensureForLogin(userName, plainPassword),
          new UnauthorizedException('Invalid credentials'),
        );
      });

      it('should rethrow error when it is not a unique constraint violation', async () => {
        // Arrange
        const otherError = new Error('Database connection failed');
        userRepository.save.mockRejectedValue(otherError);
        userRepository.findOne.mockResolvedValue(null);

        // Act & Assert
        await TestAssertionHelpers.expectToThrowAsync(
          () => service.ensureForLogin(userName, plainPassword),
          otherError,
        );
      });
    });
  });

  describe('createUser (private method)', () => {
    it('should create and save user successfully', async () => {
      // Arrange
      const createUserDto: CreateUserDto = UserFactory.createCreateUserDto();
      const createdUser = UserFactory.create();
      userRepository.create.mockReturnValue(createdUser as any);
      userRepository.save.mockResolvedValue(createdUser as any);

      // Act
      const result = await (service as any).createUser(createUserDto);

      // Assert
      expect(result).toEqual(createdUser);
      expect(userRepository.create).toHaveBeenCalledWith(createUserDto);
      expect(userRepository.save).toHaveBeenCalledWith(createdUser);
    });

    it('should log user creation', async () => {
      // Arrange
      const createUserDto: CreateUserDto = UserFactory.createCreateUserDto();
      const createdUser = UserFactory.create({ userName: 'newuser', id: 'new-id' });
      userRepository.create.mockReturnValue(createdUser as any);
      userRepository.save.mockResolvedValue(createdUser as any);

      // Act
      await (service as any).createUser(createUserDto);

      // Assert
      expect((service as any).logger.log).toHaveBeenCalledWith(
        'User created: newuser (id: new-id)',
      );
    });

    it('should log error and rethrow when QueryFailedError occurs', async () => {
      // Arrange
      const createUserDto: CreateUserDto = UserFactory.createCreateUserDto();
      const queryError = new QueryFailedError('Database error', [], '');
      userRepository.create.mockReturnValue({} as any);
      userRepository.save.mockRejectedValue(queryError);

      // Act & Assert
      await TestAssertionHelpers.expectToThrowAsync(
        () => (service as any).createUser(createUserDto),
        queryError,
      );
      expect((service as any).logger.error).toHaveBeenCalledWith('DB error creating user: ');
    });

    it('should rethrow non-QueryFailedError without logging', async () => {
      // Arrange
      const createUserDto: CreateUserDto = UserFactory.createCreateUserDto();
      const otherError = new Error('Unexpected error');
      userRepository.create.mockReturnValue({} as any);
      userRepository.save.mockRejectedValue(otherError);

      // Act & Assert
      await TestAssertionHelpers.expectToThrowAsync(
        () => (service as any).createUser(createUserDto),
        otherError,
      );
      expect((service as any).logger.error).not.toHaveBeenCalled();
    });
  });
});
