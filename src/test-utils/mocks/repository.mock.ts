// repository.mock.ts - Mocks especializados para repositorios
import { Repository } from 'typeorm';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { User } from '../../users/entities/user.entity';
import { Product } from '../../products/entities/product.entity';

export type MockRepository<T = any> = DeepMockProxy<Repository<T>>;

export class RepositoryMockFactory {
  static createUserRepository(): MockRepository<User> {
    return mockDeep<Repository<User>>();
  }

  static createProductRepository(): MockRepository<Product> {
    return mockDeep<Repository<Product>>();
  }

  static createGenericRepository<T>(): MockRepository<T> {
    return mockDeep<Repository<T>>();
  }

  static createQueryBuilder() {
    return {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orWhere: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      addOrderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      withDeleted: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn(),
      getMany: jest.fn(),
      getOne: jest.fn(),
      getRawOne: jest.fn(),
      getRawMany: jest.fn(),
      execute: jest.fn(),
      leftJoin: jest.fn().mockReturnThis(),
      innerJoin: jest.fn().mockReturnThis(),
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      innerJoinAndSelect: jest.fn().mockReturnThis(),
    };
  }
}
