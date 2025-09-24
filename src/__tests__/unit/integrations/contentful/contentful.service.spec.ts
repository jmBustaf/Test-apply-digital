import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContentfulService } from '../../../../integrations/contentful/contentful.service';
import { Product } from '../../../../products/entities/product.entity';
import { CONTENTFUL_CLIENT } from '../../../../integrations/contentful/contentful.module';

describe('ContentfulService', () => {
  let service: ContentfulService;
  let productRepo: jest.Mocked<Repository<Product>>;
  let contentfulClient: any;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    const mockContentfulClient = {
      getEntries: jest.fn(),
    };

    const mockRepository = {
      createQueryBuilder: jest.fn(),
    };

    const mockConfigService = {
      get: jest.fn().mockReturnValue('product'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContentfulService,
        {
          provide: CONTENTFUL_CLIENT,
          useValue: mockContentfulClient,
        },
        {
          provide: getRepositoryToken(Product),
          useValue: mockRepository,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<ContentfulService>(ContentfulService);
    productRepo = module.get(getRepositoryToken(Product));
    contentfulClient = module.get(CONTENTFUL_CLIENT);
    configService = module.get(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('syncAll', () => {
    it('should sync all products successfully', async () => {
      // Arrange
      const mockEntries = {
        total: 2,
        items: [
          {
            sys: {
              id: 'contentful-1',
              createdAt: '2024-01-01T00:00:00Z',
              updatedAt: '2024-01-01T00:00:00Z',
            },
            fields: {
              sku: 'SKU-001',
              name: 'Test Product 1',
              brand: 'Test Brand',
              model: 'Model 1',
              category: 'electronics',
              color: 'black',
              price: 100,
              currency: 'USD',
              stock: 10,
            },
          },
          {
            sys: {
              id: 'contentful-2',
              createdAt: '2024-01-02T00:00:00Z',
              updatedAt: '2024-01-02T00:00:00Z',
            },
            fields: {
              sku: 'SKU-002',
              name: 'Test Product 2',
              brand: 'Test Brand',
              model: 'Model 2',
              category: 'electronics',
              color: 'white',
              price: 200,
              currency: 'USD',
              stock: 5,
            },
          },
        ],
      };

      const mockQueryBuilder = {
        insert: jest.fn().mockReturnThis(),
        into: jest.fn().mockReturnThis(),
        values: jest.fn().mockReturnThis(),
        onConflict: jest.fn().mockReturnThis(),
        returning: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({ raw: [{ id: 1 }, { id: 2 }] }),
      };

      const mockUpdateQueryBuilder = {
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({ affected: 0 }),
      };

      contentfulClient.getEntries.mockResolvedValue(mockEntries);
      productRepo.createQueryBuilder
        .mockReturnValueOnce(mockQueryBuilder)
        .mockReturnValueOnce(mockUpdateQueryBuilder);

      // Act
      const result = await service.syncAll();

      // Assert
      expect(result).toEqual({
        total: 2,
        upserts: 2,
        softDeleted: 0,
      });
      expect(contentfulClient.getEntries).toHaveBeenCalledWith({
        content_type: 'product',
        skip: 0,
        limit: 100,
        order: ['sys.createdAt'],
      });
    });

    it('should handle empty results', async () => {
      // Arrange
      const mockEntries = {
        total: 0,
        items: [],
      };

      const mockQueryBuilder = {
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({ affected: 0 }),
      };

      contentfulClient.getEntries.mockResolvedValue(mockEntries);
      productRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      // Act
      const result = await service.syncAll();

      // Assert
      expect(result).toEqual({
        total: 0,
        upserts: 0,
        softDeleted: 0,
      });
    });

    it('should handle pagination', async () => {
      // Arrange
      const firstPage = {
        total: 150,
        items: Array.from({ length: 100 }, (_, i) => ({
          sys: {
            id: `contentful-${i}`,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
          },
          fields: {
            sku: `SKU-${i}`,
            name: `Test Product ${i}`,
            brand: 'Test Brand',
            model: `Model ${i}`,
            category: 'electronics',
            color: 'black',
            price: 100,
            currency: 'USD',
            stock: 10,
          },
        })),
      };

      const secondPage = {
        total: 150,
        items: Array.from({ length: 50 }, (_, i) => ({
          sys: {
            id: `contentful-${i + 100}`,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
          },
          fields: {
            sku: `SKU-${i + 100}`,
            name: `Test Product ${i + 100}`,
            brand: 'Test Brand',
            model: `Model ${i + 100}`,
            category: 'electronics',
            color: 'black',
            price: 100,
            currency: 'USD',
            stock: 10,
          },
        })),
      };

      const mockQueryBuilder = {
        insert: jest.fn().mockReturnThis(),
        into: jest.fn().mockReturnThis(),
        values: jest.fn().mockReturnThis(),
        onConflict: jest.fn().mockReturnThis(),
        returning: jest.fn().mockReturnThis(),
        execute: jest
          .fn()
          .mockResolvedValue({ raw: Array.from({ length: 100 }, (_, i) => ({ id: i })) }),
      };

      const mockUpdateQueryBuilder = {
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({ affected: 0 }),
      };

      contentfulClient.getEntries
        .mockResolvedValueOnce(firstPage)
        .mockResolvedValueOnce(secondPage);
      productRepo.createQueryBuilder
        .mockReturnValueOnce(mockQueryBuilder)
        .mockReturnValueOnce(mockQueryBuilder)
        .mockReturnValueOnce(mockUpdateQueryBuilder);

      // Act
      const result = await service.syncAll();

      // Assert
      expect(result).toEqual({
        total: 150,
        upserts: 200,
        softDeleted: 0,
      });
      expect(contentfulClient.getEntries).toHaveBeenCalledTimes(2);
    });

    it('should handle Contentful API errors', async () => {
      // Arrange
      const error = new Error('Contentful API error');
      contentfulClient.getEntries.mockRejectedValue(error);

      // Act
      const result = await service.syncAll();

      // Assert
      expect(result).toEqual({
        total: 0,
        upserts: 0,
        softDeleted: 0,
      });
    });

    it('should handle database errors during upsert', async () => {
      // Arrange
      const mockEntries = {
        total: 1,
        items: [
          {
            sys: {
              id: 'contentful-1',
              createdAt: '2024-01-01T00:00:00Z',
              updatedAt: '2024-01-01T00:00:00Z',
            },
            fields: {
              sku: 'SKU-001',
              name: 'Test Product 1',
              brand: 'Test Brand',
              model: 'Model 1',
              category: 'electronics',
              color: 'black',
              price: 100,
              currency: 'USD',
              stock: 10,
            },
          },
        ],
      };

      const mockQueryBuilder = {
        insert: jest.fn().mockReturnThis(),
        into: jest.fn().mockReturnThis(),
        values: jest.fn().mockReturnThis(),
        onConflict: jest.fn().mockReturnThis(),
        returning: jest.fn().mockReturnThis(),
        execute: jest.fn().mockRejectedValue(new Error('Database error')),
      };

      contentfulClient.getEntries.mockResolvedValue(mockEntries);
      productRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      // Act
      const result = await service.syncAll();

      // Assert
      expect(result).toEqual({
        total: 1,
        upserts: 0,
        softDeleted: 0,
      });
    });

    it('should handle soft delete with existing contentful IDs', async () => {
      // Arrange
      const mockEntries = {
        total: 1,
        items: [
          {
            sys: {
              id: 'contentful-1',
              createdAt: '2024-01-01T00:00:00Z',
              updatedAt: '2024-01-01T00:00:00Z',
            },
            fields: {
              sku: 'SKU-001',
              name: 'Test Product 1',
              brand: 'Test Brand',
              model: 'Model 1',
              category: 'electronics',
              color: 'black',
              price: 100,
              currency: 'USD',
              stock: 10,
            },
          },
        ],
      };

      const mockQueryBuilder = {
        insert: jest.fn().mockReturnThis(),
        into: jest.fn().mockReturnThis(),
        values: jest.fn().mockReturnThis(),
        onConflict: jest.fn().mockReturnThis(),
        returning: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({ raw: [{ id: 1 }] }),
      };

      const mockUpdateQueryBuilder = {
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({ affected: 2 }),
      };

      contentfulClient.getEntries.mockResolvedValue(mockEntries);
      productRepo.createQueryBuilder
        .mockReturnValueOnce(mockQueryBuilder)
        .mockReturnValueOnce(mockUpdateQueryBuilder);

      // Act
      const result = await service.syncAll();

      // Assert
      expect(result).toEqual({
        total: 1,
        upserts: 1,
        softDeleted: 2,
      });
    });

    it('should skip soft delete when sync is incomplete', async () => {
      // Arrange
      const mockEntries = {
        total: 2,
        items: [
          {
            sys: {
              id: 'contentful-1',
              createdAt: '2024-01-01T00:00:00Z',
              updatedAt: '2024-01-01T00:00:00Z',
            },
            fields: {
              sku: 'SKU-001',
              name: 'Test Product 1',
              brand: 'Test Brand',
              model: 'Model 1',
              category: 'electronics',
              color: 'black',
              price: 100,
              currency: 'USD',
              stock: 10,
            },
          },
        ],
      };

      const mockQueryBuilder = {
        insert: jest.fn().mockReturnThis(),
        into: jest.fn().mockReturnThis(),
        values: jest.fn().mockReturnThis(),
        onConflict: jest.fn().mockReturnThis(),
        returning: jest.fn().mockReturnThis(),
        execute: jest.fn().mockRejectedValue(new Error('Database error')),
      };

      contentfulClient.getEntries.mockResolvedValue(mockEntries);
      productRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      // Act
      const result = await service.syncAll();

      // Assert
      expect(result).toEqual({
        total: 2,
        upserts: 0,
        softDeleted: 0,
      });
    });
  });
});
