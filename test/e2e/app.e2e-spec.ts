import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { User } from '../src/users/entities/user.entity';
import { Product } from '../src/products/entities/product.entity';
import { UserFactory, ProductFactory } from '../src/test-utils/test-factories';

describe('App E2E Tests', () => {
  let app: INestApplication<App>;
  let moduleFixture: TestingModule;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env.test',
        }),
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [User, Product],
          synchronize: true,
          logging: false,
        }),
        JwtModule.register({
          secret: 'test-secret',
          signOptions: { expiresIn: '15m' },
        }),
        PassportModule,
        AppModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Seed test data
    const userRepository = moduleFixture.get('UserRepository');
    const productRepository = moduleFixture.get('ProductRepository');

    const testUser = UserFactory.create({ userName: 'e2etestuser', id: 'e2e-user-1' });
    await userRepository.save(testUser);

    const testProducts = [
      ProductFactory.create({
        id: 'e2e-product-1',
        name: 'E2E Test Product 1',
        category: 'Electronics',
      }),
      ProductFactory.create({
        id: 'e2e-product-2',
        name: 'E2E Test Product 2',
        category: 'Clothing',
      }),
    ];
    await productRepository.save(testProducts);

    // Get auth token
    const authResponse = await request(app.getHttpServer()).post('/api/v1/auth/login').send({
      userName: 'e2etestuser',
      password: 'plainpassword',
    });
    authToken = authResponse.body.data.token;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Health Check', () => {
    it('/ (GET) should return Hello World!', () => {
      return request(app.getHttpServer()).get('/').expect(200).expect('Hello World!');
    });
  });

  describe('Authentication Flow', () => {
    it('should complete full authentication flow', async () => {
      // Test login
      const loginResponse = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          userName: 'e2etestuser',
          password: 'plainpassword',
        })
        .expect(200);

      expect(loginResponse.body).toEqual({
        statusCode: 200,
        message: 'Login successful',
        data: {
          logged: true,
          token: expect.any(String),
          expiresIn: '15m',
        },
      });

      // Test protected endpoint with token
      const protectedResponse = await request(app.getHttpServer())
        .get('/api/v1/products/by-name')
        .query({ name: 'test', page: 1, limit: 10 })
        .set('Authorization', `Bearer ${loginResponse.body.data.token}`)
        .expect(200);

      expect(protectedResponse.body.statusCode).toBe(200);
    });
  });

  describe('Product Search Flow', () => {
    it('should complete full product search flow', async () => {
      // Search by name
      const nameResponse = await request(app.getHttpServer())
        .get('/api/v1/products/by-name')
        .query({ name: 'E2E Test', page: 1, limit: 10 })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(nameResponse.body.data.length).toBeGreaterThan(0);
      expect(nameResponse.body.meta.totalItems).toBeGreaterThan(0);

      // Search by category
      const categoryResponse = await request(app.getHttpServer())
        .get('/api/v1/products/by-category')
        .query({ category: 'Electronics', page: 1, limit: 10 })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(categoryResponse.body.data.length).toBeGreaterThan(0);

      // Search by price range
      const priceResponse = await request(app.getHttpServer())
        .get('/api/v1/products/by-price-range')
        .query({ minPrice: 0, maxPrice: 1000, page: 1, limit: 10 })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(priceResponse.body.data).toBeInstanceOf(Array);
    });
  });

  describe('Analytics Flow', () => {
    it('should complete analytics flow', async () => {
      // Get percent deleted
      const deletedResponse = await request(app.getHttpServer())
        .get('/api/v1/products/percent-deleted')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(deletedResponse.body.data.percentDeleted).toMatch(/^\d+%$/);

      // Get percent active
      const activeResponse = await request(app.getHttpServer())
        .get('/api/v1/products/percent-active')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(activeResponse.body.data.percentActive).toMatch(/^\d+%$/);
      expect(activeResponse.body.data.counts).toEqual({
        active: expect.any(Number),
        total: expect.any(Number),
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle unauthorized requests', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/products/by-name')
        .query({ name: 'test', page: 1, limit: 10 })
        .expect(401);
    });

    it('should handle invalid input', async () => {
      await request(app.getHttpServer()).post('/api/v1/auth/login').send({}).expect(400);
    });

    it('should handle invalid JWT token', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/products/by-name')
        .query({ name: 'test', page: 1, limit: 10 })
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });

  describe('Pagination', () => {
    it('should handle pagination correctly', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/products/by-name')
        .query({ name: 'E2E', page: 1, limit: 1 })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.meta).toEqual({
        page: 1,
        limit: 1,
        totalItems: expect.any(Number),
        totalPages: expect.any(Number),
      });
      expect(response.body.data.length).toBeLessThanOrEqual(1);
    });
  });
});
