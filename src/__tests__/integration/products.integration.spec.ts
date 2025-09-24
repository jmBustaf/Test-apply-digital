import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import * as request from 'supertest';
import { ProductsModule } from '../products/products.module';
import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module';
import { User } from '../users/entities/user.entity';
import { Product } from '../products/entities/product.entity';
import { UserFactory, ProductFactory } from '../test-utils/test-factories';
import { IntegrationTestSetup } from '../test-utils/integration-test-setup';

describe('Products Integration Tests', () => {
  let app: INestApplication;
  let moduleFixture: TestingModule;
  let authToken: string;

  beforeAll(async () => {
    const setup = await IntegrationTestSetup.createTestAppWithDatabase();
    app = setup.app;
    moduleFixture = setup.moduleFixture;

    // Seed test data
    await IntegrationTestSetup.seedTestData(moduleFixture);

    // Get auth token
    const authResponse = await request(app.getHttpServer()).post('/api/v1/auth/login').send({
      userName: 'testuser1',
      password: 'plainpassword',
    });
    authToken = authResponse.body.data.token;
  });

  afterAll(async () => {
    await IntegrationTestSetup.cleanup(app);
  });

  describe('GET /api/v1/products/by-name', () => {
    it('should return products matching name with pagination', async () => {
      // Act
      const response = await request(app.getHttpServer())
        .get('/api/v1/products/by-name')
        .query({ name: 'Test Product', page: 1, limit: 10 })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Assert
      expect(response.body).toEqual({
        statusCode: 200,
        message: 'Products retrieved successfully',
        data: expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(String),
            name: expect.stringContaining('Test Product'),
            category: expect.any(String),
          }),
        ]),
        meta: {
          page: 1,
          limit: 10,
          totalItems: expect.any(Number),
          totalPages: expect.any(Number),
        },
      });
    });

    it('should return empty array when no products match', async () => {
      // Act
      const response = await request(app.getHttpServer())
        .get('/api/v1/products/by-name')
        .query({ name: 'NonExistentProduct', page: 1, limit: 10 })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Assert
      expect(response.body.data).toEqual([]);
      expect(response.body.meta.totalItems).toBe(0);
    });

    it('should handle case-insensitive search', async () => {
      // Act
      const response = await request(app.getHttpServer())
        .get('/api/v1/products/by-name')
        .query({ name: 'test product', page: 1, limit: 10 })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Assert
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should require authentication', async () => {
      // Act
      const response = await request(app.getHttpServer())
        .get('/api/v1/products/by-name')
        .query({ name: 'test', page: 1, limit: 10 })
        .expect(401);

      // Assert
      expect(response.body.statusCode).toBe(401);
    });

    it('should validate query parameters', async () => {
      // Act
      const response = await request(app.getHttpServer())
        .get('/api/v1/products/by-name')
        .query({ name: '', page: 0, limit: -1 })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      // Assert
      expect(response.body.statusCode).toBe(400);
    });
  });

  describe('GET /api/v1/products/by-category', () => {
    it('should return products matching category', async () => {
      // Act
      const response = await request(app.getHttpServer())
        .get('/api/v1/products/by-category')
        .query({ category: 'Electronics', page: 1, limit: 10 })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Assert
      expect(response.body.data).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            category: 'Electronics',
          }),
        ]),
      );
    });

    it('should handle case-insensitive category search', async () => {
      // Act
      const response = await request(app.getHttpServer())
        .get('/api/v1/products/by-category')
        .query({ category: 'electronics', page: 1, limit: 10 })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Assert
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/v1/products/by-price-range', () => {
    it('should return products within price range', async () => {
      // Act
      const response = await request(app.getHttpServer())
        .get('/api/v1/products/by-price-range')
        .query({ minPrice: 0, maxPrice: 1000, page: 1, limit: 10 })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Assert
      expect(response.body.statusCode).toBe(200);
      expect(response.body.data).toBeInstanceOf(Array);
    });

    it('should handle only minPrice', async () => {
      // Act
      const response = await request(app.getHttpServer())
        .get('/api/v1/products/by-price-range')
        .query({ minPrice: 50, page: 1, limit: 10 })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Assert
      expect(response.body.statusCode).toBe(200);
    });

    it('should handle only maxPrice', async () => {
      // Act
      const response = await request(app.getHttpServer())
        .get('/api/v1/products/by-price-range')
        .query({ maxPrice: 100, page: 1, limit: 10 })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Assert
      expect(response.body.statusCode).toBe(200);
    });
  });

  describe('GET /api/v1/products/percent-deleted', () => {
    it('should return percentage of deleted products', async () => {
      // Act
      const response = await request(app.getHttpServer())
        .get('/api/v1/products/percent-deleted')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Assert
      expect(response.body).toEqual({
        statusCode: 200,
        message: 'Deleted percentage retrieved successfully',
        data: {
          percentDeleted: expect.stringMatching(/^\d+%$/),
        },
      });
    });
  });

  describe('GET /api/v1/products/percent-active', () => {
    it('should return percentage of active products with default parameters', async () => {
      // Act
      const response = await request(app.getHttpServer())
        .get('/api/v1/products/percent-active')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Assert
      expect(response.body).toEqual({
        statusCode: 200,
        message: 'Active percentage retrieved successfully',
        data: {
          percentActive: expect.stringMatching(/^\d+%$/),
          counts: {
            active: expect.any(Number),
            total: expect.any(Number),
          },
        },
      });
    });

    it('should handle custom date range parameters', async () => {
      // Act
      const response = await request(app.getHttpServer())
        .get('/api/v1/products/percent-active')
        .query({
          from: '2024-01-01',
          to: '2024-12-31',
          hasPrice: 'all',
          dateField: 'created',
        })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Assert
      expect(response.body.statusCode).toBe(200);
      expect(response.body.data.percentActive).toMatch(/^\d+%$/);
    });
  });

  describe('DELETE /api/v1/products/soft-delete/:sku', () => {
    it('should soft delete product by SKU', async () => {
      // Arrange - First create a product with a known SKU
      const productRepository = moduleFixture.get('ProductRepository');
      const testProduct = ProductFactory.create({
        sku: 'TEST-DELETE-SKU',
        name: 'Product to Delete',
      });
      await productRepository.save(testProduct);

      // Act
      const response = await request(app.getHttpServer())
        .delete('/api/v1/products/soft-delete/TEST-DELETE-SKU')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Assert
      expect(response.body).toEqual({
        statusCode: 200,
        message: 'Product deleted successfully',
        data: null,
      });

      // Verify product is soft deleted
      const deletedProduct = await productRepository.findOne({
        where: { sku: 'TEST-DELETE-SKU' },
        withDeleted: true,
      });
      expect(deletedProduct.isDeleted).toBe(true);
      expect(deletedProduct.deletedAt).toBeTruthy();
    });

    it('should return 404 for non-existent SKU', async () => {
      // Act
      const response = await request(app.getHttpServer())
        .delete('/api/v1/products/soft-delete/NONEXISTENT-SKU')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      // Assert
      expect(response.body.statusCode).toBe(404);
    });

    it('should normalize SKU to uppercase', async () => {
      // Arrange
      const productRepository = moduleFixture.get('ProductRepository');
      const testProduct = ProductFactory.create({
        sku: 'test-lowercase-sku',
        name: 'Product to Delete',
      });
      await productRepository.save(testProduct);

      // Act
      const response = await request(app.getHttpServer())
        .delete('/api/v1/products/soft-delete/test-lowercase-sku')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Assert
      expect(response.body.statusCode).toBe(200);
    });
  });
});
