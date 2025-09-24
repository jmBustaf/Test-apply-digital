import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/entities/user.entity';
import { Product } from '../products/entities/product.entity';
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';

export type MockRepository<T = any> = DeepMockProxy<Repository<T>>;

export class TestModuleBuilder {
  private providers: any[] = [];
  private imports: any[] = [];

  addProvider(provider: any): this {
    this.providers.push(provider);
    return this;
  }

  addImport(module: any): this {
    this.imports.push(module);
    return this;
  }

  async build(): Promise<TestingModule> {
    return Test.createTestingModule({
      imports: this.imports,
      providers: this.providers,
    }).compile();
  }
}

export class MockRepositoryFactory {
  static createUserRepository(): MockRepository<User> {
    return mockDeep<Repository<User>>();
  }

  static createProductRepository(): MockRepository<Product> {
    return mockDeep<Repository<Product>>();
  }
}

export class MockServiceFactory {
  static createConfigService(overrides: Record<string, any> = {}): DeepMockProxy<ConfigService> {
    const mock = mockDeep<ConfigService>();
    mock.get.mockImplementation((key: string, defaultValue?: any) => {
      return overrides[key] ?? defaultValue;
    });
    return mock;
  }

  static createJwtService(): DeepMockProxy<JwtService> {
    return mockDeep<JwtService>();
  }
}

export class TestDatabaseHelpers {
  static createQueryBuilder() {
    return {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      addOrderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      withDeleted: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn(),
      getRawOne: jest.fn(),
      execute: jest.fn(),
    };
  }

  static mockFindOne(repository: MockRepository, returnValue: any) {
    repository.findOne.mockResolvedValue(returnValue);
  }

  static mockFindOneBy(repository: MockRepository, returnValue: any) {
    repository.findOneBy.mockResolvedValue(returnValue);
  }

  static mockSave(repository: MockRepository, returnValue: any) {
    repository.save.mockResolvedValue(returnValue);
  }

  static mockCreate(repository: MockRepository, returnValue: any) {
    repository.create.mockReturnValue(returnValue);
  }

  static mockQueryBuilder(repository: MockRepository, queryBuilder: any) {
    repository.createQueryBuilder.mockReturnValue(queryBuilder);
  }
}

export class TestAssertionHelpers {
  static expectToThrowAsync(fn: () => Promise<any>, expectedError?: any) {
    return expect(fn()).rejects.toThrow(expectedError);
  }

  static expectToNotThrowAsync(fn: () => Promise<any>) {
    return expect(fn()).resolves.not.toThrow();
  }

  static expectRepositoryToBeCalledWith(
    repository: MockRepository,
    method: string,
    ...args: any[]
  ) {
    expect(repository[method]).toHaveBeenCalledWith(...args);
  }

  static expectRepositoryToBeCalledTimes(
    repository: MockRepository,
    method: string,
    times: number,
  ) {
    expect(repository[method]).toHaveBeenCalledTimes(times);
  }
}

export function resetAllMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
}

export function createMockLogger() {
  return {
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    verbose: jest.fn(),
  };
}
