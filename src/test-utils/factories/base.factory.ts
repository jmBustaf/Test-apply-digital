import { User, Role } from '../../users/entities/user.entity';
import { Product } from '../../products/entities/product.entity';
import { CreateUserDto } from '../../users/dto/create-user.dto';
import { LoginDto } from '../../auth/dto/login.dto';
import { PercentActiveDto, PriceFlag, DateField } from '../../products/dto/percent-active.dto';

export class UserFactory {
  static create(overrides: Partial<User> = {}): User {
    return {
      id: 'test-user-id',
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
}

export class ProductFactory {
  static create(overrides: Partial<Product> = {}): Product {
    return {
      id: 'test-product-id',
      contentful_id: 'contentful-123',
      sku: 'SKU-123',
      name: 'Test Product',
      brand: 'Test Brand',
      model: 'Test Model',
      category: 'Electronics',
      color: 'Black',
      price: '99.99',
      currency: 'USD',
      stock: 10,
      isDeleted: false,
      deletedAt: null,
      createdAt: new Date('2024-01-01T00:00:00Z'),
      updatedAt: new Date('2024-01-01T00:00:00Z'),
      ...overrides,
    };
  }

  static createDeleted(overrides: Partial<Product> = {}): Product {
    return this.create({
      isDeleted: true,
      deletedAt: new Date('2024-01-02T00:00:00Z'),
      ...overrides,
    });
  }

  static createMany(count: number, overrides: Partial<Product> = {}): Product[] {
    return Array.from({ length: count }, (_, index) =>
      this.create({
        id: `test-product-${index + 1}`,
        sku: `SKU-${index + 1}`,
        name: `Test Product ${index + 1}`,
        ...overrides,
      }),
    );
  }
}

export class DtoFactory {
  static createPercentActiveDto(overrides: Partial<PercentActiveDto> = {}): PercentActiveDto {
    return {
      from: '2024-01-01',
      to: '2024-01-31',
      hasPrice: PriceFlag.ALL,
      dateField: DateField.CREATED,
      ...overrides,
    } as PercentActiveDto;
  }
}

export class MockDataFactory {
  static createPaginatedResponse<T>(data: T[], page: number, limit: number, totalItems: number) {
    return {
      statusCode: 200,
      message: 'Success',
      data,
      meta: {
        page,
        limit,
        totalItems,
        totalPages: Math.max(1, Math.ceil(totalItems / limit)),
      },
    };
  }

  static createAuthResponse(token: string, expiresIn: string = '15m') {
    return {
      statusCode: 200,
      message: 'Login successful',
      data: {
        logged: true,
        token,
        expiresIn,
      },
    };
  }

  static createErrorResponse(message: string, statusCode: number = 500) {
    return {
      statusCode,
      message,
    };
  }
}
