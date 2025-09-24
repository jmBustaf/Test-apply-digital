import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductsController } from '../../../products/products.controller';
import { ProductsService } from '../../../products/products.service';
import { Product } from '../../../products/entities/product.entity';
import { ProductFactory } from '../../../test-utils/factories';

describe('ProductsController', () => {
  let controller: ProductsController;
  let service: ProductsService;

  beforeEach(async () => {
    const mockRepository = {
      createQueryBuilder: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        ProductsService,
        {
          provide: getRepositoryToken(Product),
          useValue: mockRepository,
        },
      ],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
    service = module.get<ProductsService>(ProductsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getByName', () => {
    it('should return products by name', async () => {
      // Arrange
      const products = [ProductFactory.create()];
      const expectedResponse = {
        statusCode: 200,
        message: 'Products retrieved successfully',
        data: products,
        meta: { page: 1, limit: 10, totalItems: 1, totalPages: 1 },
      };
      const findByNameSpy = jest.spyOn(service, 'findByName').mockResolvedValue(expectedResponse);

      // Act
      const result = await controller.getByName({ name: 'test', page: 1, limit: 10 });

      // Assert
      expect(result).toEqual(expectedResponse);
      expect(findByNameSpy).toHaveBeenCalledWith({
        name: 'test',
        page: 1,
        limit: 10,
      });
    });

    it('should handle service errors', async () => {
      // Arrange
      const findByNameSpy = jest
        .spyOn(service, 'findByName')
        .mockRejectedValue(new Error('Service error'));

      // Act & Assert
      await expect(controller.getByName({ name: 'test', page: 1, limit: 10 })).rejects.toThrow(
        'Service error',
      );
      expect(findByNameSpy).toHaveBeenCalledWith({
        name: 'test',
        page: 1,
        limit: 10,
      });
    });
  });

  describe('getByCategory', () => {
    it('should return products by category', async () => {
      // Arrange
      const products = [ProductFactory.create()];
      const expectedResponse = {
        statusCode: 200,
        message: 'Products retrieved successfully',
        data: products,
        meta: { page: 1, limit: 10, totalItems: 1, totalPages: 1 },
      };
      const findByCategorySpy = jest
        .spyOn(service, 'findByCategory')
        .mockResolvedValue(expectedResponse);

      // Act
      const result = await controller.getByCategory({
        category: 'electronics',
        page: 1,
        limit: 10,
      });

      // Assert
      expect(result).toEqual(expectedResponse);
      expect(findByCategorySpy).toHaveBeenCalledWith({
        category: 'electronics',
        page: 1,
        limit: 10,
      });
    });
  });

  describe('getByPriceRange', () => {
    it('should return products by price range', async () => {
      // Arrange
      const products = [ProductFactory.create()];
      const expectedResponse = {
        statusCode: 200,
        message: 'Products retrieved successfully',
        data: products,
        meta: { page: 1, limit: 10, totalItems: 1, totalPages: 1 },
      };
      const findByPriceRangeSpy = jest
        .spyOn(service, 'findByPriceRange')
        .mockResolvedValue(expectedResponse);

      // Act
      const result = await controller.getByPriceRange({
        minPrice: 10,
        maxPrice: 100,
        page: 1,
        limit: 10,
      });

      // Assert
      expect(result).toEqual(expectedResponse);
      expect(findByPriceRangeSpy).toHaveBeenCalledWith({
        minPrice: 10,
        maxPrice: 100,
        page: 1,
        limit: 10,
      });
    });

    it('should handle null prices', async () => {
      // Arrange
      const products = [ProductFactory.create()];
      const expectedResponse = {
        statusCode: 200,
        message: 'Products retrieved successfully',
        data: products,
        meta: { page: 1, limit: 10, totalItems: 1, totalPages: 1 },
      };
      const findByPriceRangeSpy = jest
        .spyOn(service, 'findByPriceRange')
        .mockResolvedValue(expectedResponse);

      // Act
      const result = await controller.getByPriceRange({
        minPrice: null,
        maxPrice: null,
        page: 1,
        limit: 10,
      });

      // Assert
      expect(result).toEqual(expectedResponse);
      expect(findByPriceRangeSpy).toHaveBeenCalledWith({
        minPrice: null,
        maxPrice: null,
        page: 1,
        limit: 10,
      });
    });
  });

  describe('getPercentDeleted', () => {
    it('should return percent deleted', async () => {
      // Arrange
      const expectedResponse = {
        statusCode: 200,
        message: 'Deleted percentage retrieved successfully',
        data: { percentDeleted: '25%' },
      };
      const getPercentDeletedSpy = jest
        .spyOn(service, 'getPercentDeleted')
        .mockResolvedValue(expectedResponse);

      // Act
      const result = await controller.getPercentDeleted();

      // Assert
      expect(result).toEqual(expectedResponse);
      expect(getPercentDeletedSpy).toHaveBeenCalled();
    });
  });

  describe('getPercentActive', () => {
    it('should return percent active with default parameters', async () => {
      // Arrange
      const expectedResponse = {
        statusCode: 200,
        message: 'Active percentage retrieved successfully',
        data: { percentActive: '80%', counts: { active: 80, total: 100 } },
      };
      const getPercentActiveSpy = jest
        .spyOn(service, 'getPercentActive')
        .mockResolvedValue(expectedResponse);

      // Act
      const result = await controller.getPercentActive({});

      // Assert
      expect(result).toEqual(expectedResponse);
      expect(getPercentActiveSpy).toHaveBeenCalledWith({});
    });

    it('should return percent active with custom parameters', async () => {
      // Arrange
      const dto = {
        from: '2024-01-01',
        to: '2024-12-31',
        hasPrice: 'all',
        dateField: 'created',
      };
      const expectedResponse = {
        statusCode: 200,
        message: 'Active percentage retrieved successfully',
        data: { percentActive: '80%', counts: { active: 80, total: 100 } },
      };
      const getPercentActiveSpy = jest
        .spyOn(service, 'getPercentActive')
        .mockResolvedValue(expectedResponse);

      // Act
      const result = await controller.getPercentActive(dto);

      // Assert
      expect(result).toEqual(expectedResponse);
      expect(getPercentActiveSpy).toHaveBeenCalledWith(dto);
    });
  });

  describe('softDeleteBySku', () => {
    it('should soft delete product by SKU', async () => {
      // Arrange
      const expectedResponse = {
        statusCode: 200,
        message: 'Product deleted successfully',
        data: null,
      };
      const softDeleteBySkuSpy = jest
        .spyOn(service, 'softDeleteBySku')
        .mockResolvedValue(expectedResponse);

      // Act
      const result = await controller.softDeleteBySku('TEST-SKU-123');

      // Assert
      expect(result).toEqual(expectedResponse);
      expect(softDeleteBySkuSpy).toHaveBeenCalledWith('TEST-SKU-123');
    });
  });
});
