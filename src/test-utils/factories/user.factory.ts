// user.factory.ts - Factory especializada para User
import { User, Role } from '../../users/entities/user.entity';
import { CreateUserDto } from '../../users/dto/create-user.dto';
import { LoginDto } from '../../auth/dto/login.dto';

export class UserFactory {
  private static idCounter = 1;

  static create(overrides: Partial<User> = {}): User {
    const id = `test-user-${this.idCounter++}`;

    return {
      id,
      userName: 'testuser',
      role: Role.USER,
      password: 'hashedpassword',
      createdAt: new Date('2024-01-01T00:00:00Z'),
      ...overrides,
    };
  }

  static createWithPassword(
    overrides: Partial<User & { password: string }> = {},
  ): User & { password: string } {
    return {
      ...this.create(overrides),
      password: 'hashed-password',
      ...overrides,
    };
  }

  static createAdmin(overrides: Partial<User> = {}): User {
    return this.create({
      role: Role.ADMIN,
      userName: 'admin',
      ...overrides,
    });
  }

  static createMany(count: number, overrides: Partial<User> = {}): User[] {
    return Array.from({ length: count }, (_, index) =>
      this.create({
        id: `test-user-${index + 1}`,
        userName: `testuser${index + 1}`,
        ...overrides,
      }),
    );
  }

  static createCreateUserDto(overrides: Partial<CreateUserDto> = {}): CreateUserDto {
    return {
      userName: 'testuser',
      password: 'hashed-password',
      role: Role.USER,
      ...overrides,
    };
  }

  static createLoginDto(overrides: Partial<LoginDto> = {}): LoginDto {
    return {
      userName: 'testuser',
      password: 'plainpassword',
      ...overrides,
    };
  }

  static createAdminLoginDto(overrides: Partial<LoginDto> = {}): LoginDto {
    return {
      userName: 'admin',
      password: 'adminpassword',
      ...overrides,
    };
  }

  // Reset counter for consistent test data
  static reset() {
    this.idCounter = 1;
  }
}
