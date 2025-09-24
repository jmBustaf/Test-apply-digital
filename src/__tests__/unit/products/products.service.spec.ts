import { Test, TestingModule } from '@nestjs/testing';
import { InternalServerErrorException, NotFoundException, HttpStatus } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { ProductsService } from '../../../products/products.service';
import { Product } from '../../../products/entities/product.entity';
import { PercentActiveDto, PriceFlag, DateField } from '../../../products/dto/percent-active.dto';
import {
  MockRepositoryFactory,
  TestDatabaseHelpers,
  TestAssertionHelpers,
  resetAllMocks,
  createMockLogger,
} from '../../../test-utils/helpers';
import { ProductFactory, DtoFactory } from '../../../test-utils/factories';

describe('ProductsService', () => {
  let service: ProductsService;
  let productRepository: ReturnType<typeof MockRepositoryFactory.createProductRepository>;

  beforeEach(async () => {
    resetAllMocks();

    productRepository = MockRepositoryFactory.createProductRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getRepositoryToken(Product),
          useValue: productRepository,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    // Mock the logger
    (service as any).logger = createMockLogger();
  });

  describe('findByName', () => {
    const params = { name: 'test product', page: 1, limit: 10 };

    it('should return products matching name with pagination', async () => {
      // Arrange
      const products = ProductFactory.createMany(2);
      const queryBuilder = TestDatabaseHelpers.createQueryBuilder();
      queryBuilder.getManyAndCount.mockResolvedValue([products, 2]);
      productRepository.createQueryBuilder.mockReturnValue(queryBuilder as any);

      // Act
      const result = await service.findByName(params);

      // Assert
      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        message: 'Products retrieved successfully',
        data: products,
        meta: {
          page: 1,
          limit: 10,
          totalItems: 2,
          totalPages: 1,
        },
      });
      expect(queryBuilder.where).toHaveBeenCalledWith({ isDeleted: false });
      expect(queryBuilder.andWhere).toHaveBeenCalledWith({ name: expect.any(Object) });
      expect(queryBuilder.orderBy).toHaveBeenCalledWith('p."created_at"', 'DESC');
      expect(queryBuilder.addOrderBy).toHaveBeenCalledWith('p."id"', 'DESC');
      expect(queryBuilder.skip).toHaveBeenCalledWith(0);
      expect(queryBuilder.take).toHaveBeenCalledWith(10);
    });

    it('should trim search name', async () => {
      // Arrange
      const paramsWithSpaces = { name: '  test product  ', page: 1, limit: 10 };
      const queryBuilder = TestDatabaseHelpers.createQueryBuilder();
      queryBuilder.getManyAndCount.mockResolvedValue([[], 0]);
      productRepository.createQueryBuilder.mockReturnValue(queryBuilder as any);

      // Act
      await service.findByName(paramsWithSpaces);

      // Assert
      expect(queryBuilder.andWhere).toHaveBeenCalledWith({
        name: expect.objectContaining({
          _type: 'ilike',
          _value: '%test product%',
        }),
      });
    });

    it('should handle database errors and throw InternalServerErrorException', async () => {
      // Arrange
      const queryBuilder = TestDatabaseHelpers.createQueryBuilder();
      queryBuilder.getManyAndCount.mockRejectedValue(new Error('Database error'));
      productRepository.createQueryBuilder.mockReturnValue(queryBuilder as any);

      // Act & Assert
      await TestAssertionHelpers.expectToThrowAsync(
        () => service.findByName(params),
        new InternalServerErrorException('Failed to retrieve products by name'),
      );
      expect((service as any).logger.error).toHaveBeenCalledWith(
        'findByName failed',
        expect.any(Error),
      );
    });
  });

  describe('findByCategory', () => {
    const params = { category: 'electronics', page: 1, limit: 10 };

    it('should return products matching category with pagination', async () => {
      // Arrange
      const products = ProductFactory.createMany(3);
      const queryBuilder = TestDatabaseHelpers.createQueryBuilder();
      queryBuilder.getManyAndCount.mockResolvedValue([products, 3]);
      productRepository.createQueryBuilder.mockReturnValue(queryBuilder as any);

      // Act
      const result = await service.findByCategory(params);

      // Assert
      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        message: 'Products retrieved successfully',
        data: products,
        meta: {
          page: 1,
          limit: 10,
          totalItems: 3,
          totalPages: 1,
        },
      });
      expect(queryBuilder.where).toHaveBeenCalledWith({ isDeleted: false });
      expect(queryBuilder.andWhere).toHaveBeenCalledWith({ category: expect.any(Object) });
    });

    it('should handle database errors and throw InternalServerErrorException', async () => {
      // Arrange
      const queryBuilder = TestDatabaseHelpers.createQueryBuilder();
      queryBuilder.getManyAndCount.mockRejectedValue(new Error('Database error'));
      productRepository.createQueryBuilder.mockReturnValue(queryBuilder as any);

      // Act & Assert
      await TestAssertionHelpers.expectToThrowAsync(
        () => service.findByCategory(params),
        new InternalServerErrorException('Failed to retrieve products by category'),
      );
    });
  });

  describe('findByPriceRange', () => {
    const params = { minPrice: 10, maxPrice: 100, page: 1, limit: 10 };

    it('should return products within price range', async () => {
      // Arrange
      const products = ProductFactory.createMany(2);
      const queryBuilder = TestDatabaseHelpers.createQueryBuilder();
      queryBuilder.getManyAndCount.mockResolvedValue([products, 2]);
      productRepository.createQueryBuilder.mockReturnValue(queryBuilder as any);

      // Act
      const result = await service.findByPriceRange(params);

      // Assert
      expect(result.statusCode).toBe(HttpStatus.OK);
      expect(queryBuilder.andWhere).toHaveBeenCalledWith('p."price" >= :minPrice', {
        minPrice: 10,
      });
      expect(queryBuilder.andWhere).toHaveBeenCalledWith('p."price" <= :maxPrice', {
        maxPrice: 100,
      });
    });

    it('should handle only minPrice', async () => {
      // Arrange
      const paramsMinOnly = { minPrice: 50, page: 1, limit: 10 };
      const queryBuilder = TestDatabaseHelpers.createQueryBuilder();
      queryBuilder.getManyAndCount.mockResolvedValue([[], 0]);
      productRepository.createQueryBuilder.mockReturnValue(queryBuilder as any);

      // Act
      await service.findByPriceRange(paramsMinOnly);

      // Assert
      expect(queryBuilder.andWhere).toHaveBeenCalledWith('p."price" >= :minPrice', {
        minPrice: 50,
      });
      expect(queryBuilder.andWhere).not.toHaveBeenCalledWith(
        'p."price" <= :maxPrice',
        expect.any(Object),
      );
    });

    it('should handle only maxPrice', async () => {
      // Arrange
      const paramsMaxOnly = { maxPrice: 200, page: 1, limit: 10 };
      const queryBuilder = TestDatabaseHelpers.createQueryBuilder();
      queryBuilder.getManyAndCount.mockResolvedValue([[], 0]);
      productRepository.createQueryBuilder.mockReturnValue(queryBuilder as any);

      // Act
      await service.findByPriceRange(paramsMaxOnly);

      // Assert
      expect(queryBuilder.andWhere).not.toHaveBeenCalledWith(
        'p."price" >= :minPrice',
        expect.any(Object),
      );
      expect(queryBuilder.andWhere).toHaveBeenCalledWith('p."price" <= :maxPrice', {
        maxPrice: 200,
      });
    });

    it('should handle null prices', async () => {
      // Arrange
      const paramsWithNulls = { minPrice: null, maxPrice: null, page: 1, limit: 10 };
      const queryBuilder = TestDatabaseHelpers.createQueryBuilder();
      queryBuilder.getManyAndCount.mockResolvedValue([[], 0]);
      productRepository.createQueryBuilder.mockReturnValue(queryBuilder as any);

      // Act
      await service.findByPriceRange(paramsWithNulls);

      // Assert
      expect(queryBuilder.andWhere).not.toHaveBeenCalledWith(
        'p."price" >= :minPrice',
        expect.any(Object),
      );
      expect(queryBuilder.andWhere).not.toHaveBeenCalledWith(
        'p."price" <= :maxPrice',
        expect.any(Object),
      );
    });
  });

  describe('getPercentDeleted', () => {
    it('should return correct percentage of deleted products', async () => {
      // Arrange
      const queryBuilder = TestDatabaseHelpers.createQueryBuilder();
      queryBuilder.getRawOne.mockResolvedValue({ total: '100', deleted: '25' });
      productRepository.createQueryBuilder.mockReturnValue(queryBuilder as any);

      // Act
      const result = await service.getPercentDeleted();

      // Assert
      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        message: 'Deleted percentage retrieved successfully',
        data: { percentDeleted: '25%' },
      });
      expect(queryBuilder.withDeleted).toHaveBeenCalled();
    });

    it('should handle zero total products', async () => {
      // Arrange
      const queryBuilder = TestDatabaseHelpers.createQueryBuilder();
      queryBuilder.getRawOne.mockResolvedValue({ total: '0', deleted: '0' });
      productRepository.createQueryBuilder.mockReturnValue(queryBuilder as any);

      // Act
      const result = await service.getPercentDeleted();

      // Assert
      expect(result.data.percentDeleted).toBe('0%');
    });

    it('should handle null deleted count', async () => {
      // Arrange
      const queryBuilder = TestDatabaseHelpers.createQueryBuilder();
      queryBuilder.getRawOne.mockResolvedValue({ total: '100', deleted: null });
      productRepository.createQueryBuilder.mockReturnValue(queryBuilder as any);

      // Act
      const result = await service.getPercentDeleted();

      // Assert
      expect(result.data.percentDeleted).toBe('0%');
    });
  });

  describe('getPercentActive', () => {
    const dto = DtoFactory.createPercentActiveDto();

    it('should return correct percentage of active products', async () => {
      // Arrange
      const queryBuilder = TestDatabaseHelpers.createQueryBuilder();
      queryBuilder.getRawOne.mockResolvedValue({ total: '100', active: '80' });
      productRepository.createQueryBuilder.mockReturnValue(queryBuilder as any);

      // Act
      const result = await service.getPercentActive(dto);

      // Assert
      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        message: 'Active percentage retrieved successfully',
        data: {
          percentActive: '80%',
          counts: { active: 80, total: 100 },
        },
      });
    });

    it('should handle different date fields', async () => {
      // Arrange
      const dtoUpdated = DtoFactory.createPercentActiveDto({ dateField: DateField.UPDATED });
      const queryBuilder = TestDatabaseHelpers.createQueryBuilder();
      queryBuilder.getRawOne.mockResolvedValue({ total: '50', active: '40' });
      productRepository.createQueryBuilder.mockReturnValue(queryBuilder as any);

      // Act
      await service.getPercentActive(dtoUpdated);

      // Assert
      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'p."updated_at" >= :fromISO',
        expect.any(Object),
      );
    });

    it('should handle price flags correctly', async () => {
      // Arrange
      const dtoWithPrice = DtoFactory.createPercentActiveDto({ hasPrice: PriceFlag.WITH });
      const queryBuilder = TestDatabaseHelpers.createQueryBuilder();
      queryBuilder.getRawOne.mockResolvedValue({ total: '50', active: '40' });
      productRepository.createQueryBuilder.mockReturnValue(queryBuilder as any);

      // Act
      await service.getPercentActive(dtoWithPrice);

      // Assert
      expect(queryBuilder.andWhere).toHaveBeenCalledWith('p."price" IS NOT NULL AND p."price" > 0');
    });

    it('should handle without price flag', async () => {
      // Arrange
      const dtoWithoutPrice = DtoFactory.createPercentActiveDto({ hasPrice: PriceFlag.WITHOUT });
      const queryBuilder = TestDatabaseHelpers.createQueryBuilder();
      queryBuilder.getRawOne.mockResolvedValue({ total: '50', active: '40' });
      productRepository.createQueryBuilder.mockReturnValue(queryBuilder as any);

      // Act
      await service.getPercentActive(dtoWithoutPrice);

      // Assert
      expect(queryBuilder.andWhere).toHaveBeenCalledWith('(p."price" IS NULL OR p."price" = 0)');
    });
  });

  describe('softDeleteBySku', () => {
    it('should soft delete product by SKU successfully', async () => {
      // Arrange
      const sku = 'TEST-SKU-123';
      const mockQueryBuilder = {
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({ affected: 1 }),
      };
      productRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      // Act
      const result = await service.softDeleteBySku(sku);

      // Assert
      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        message: 'Product deleted successfully',
        data: null,
      });
      expect(mockQueryBuilder.update).toHaveBeenCalledWith(Product);
      expect(mockQueryBuilder.set).toHaveBeenCalledWith({
        isDeleted: true,
        deletedAt: expect.any(Function),
      });
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('"sku" = :sku', { sku: 'TEST-SKU-123' });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('"deleted_at" IS NULL');
    });

    it('should normalize SKU to uppercase and trim', async () => {
      // Arrange
      const skuWithSpaces = '  test-sku-123  ';
      const mockQueryBuilder = {
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({ affected: 1 }),
      };
      productRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      // Act
      await service.softDeleteBySku(skuWithSpaces);

      // Assert
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('"sku" = :sku', { sku: 'TEST-SKU-123' });
    });

    it('should throw NotFoundException when SKU is empty after trimming', async () => {
      // Act & Assert
      await TestAssertionHelpers.expectToThrowAsync(
        () => service.softDeleteBySku('   '),
        new NotFoundException('Product not found or already deleted'),
      );
    });

    it('should throw NotFoundException when no product is affected', async () => {
      // Arrange
      const sku = 'NONEXISTENT-SKU';
      const mockQueryBuilder = {
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({ affected: 0 }),
      };
      productRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      // Act & Assert
      await TestAssertionHelpers.expectToThrowAsync(
        () => service.softDeleteBySku(sku),
        new NotFoundException('Product not found or already deleted'),
      );
    });

    it('should handle database errors and throw InternalServerErrorException', async () => {
      // Arrange
      const sku = 'TEST-SKU';
      const queryBuilder = TestDatabaseHelpers.createQueryBuilder();
      queryBuilder.execute.mockRejectedValue(new Error('Database error'));
      productRepository.createQueryBuilder.mockReturnValue(queryBuilder as any);

      // Act & Assert
      await TestAssertionHelpers.expectToThrowAsync(
        () => service.softDeleteBySku(sku),
        new InternalServerErrorException('Failed to delete product by sku'),
      );
    });
  });
});
