// test-database.helper.ts - Helpers para tests de base de datos
import { MockRepository } from '../mocks/repository.mock';

export class TestDatabaseHelpers {
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
      update: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
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

  static mockFindOne(repository: MockRepository, returnValue: any) {
    repository.findOne.mockResolvedValue(returnValue);
  }

  static mockFindOneBy(repository: MockRepository, returnValue: any) {
    repository.findOneBy.mockResolvedValue(returnValue);
  }

  static mockFindMany(repository: MockRepository, returnValue: any[]) {
    repository.find.mockResolvedValue(returnValue);
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

  static mockCount(repository: MockRepository, count: number) {
    repository.count.mockResolvedValue(count);
  }

  static mockExists(repository: MockRepository, exists: boolean) {
    repository.exists.mockResolvedValue(exists);
  }

  static mockDelete(repository: MockRepository, result: any) {
    repository.delete.mockResolvedValue(result);
  }

  static mockSoftDelete(repository: MockRepository, result: any) {
    repository.softDelete.mockResolvedValue(result);
  }
}
