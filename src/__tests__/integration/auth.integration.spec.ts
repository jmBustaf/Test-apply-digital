import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import * as request from 'supertest';
import { AuthModule } from '../../auth/auth.module';
import { UsersModule } from '../../users/users.module';
import { User } from '../../users/entities/user.entity';
import { UserFactory } from '../../test-utils/factories';
import { IntegrationTestSetup } from '../../test-utils/setup/integration.setup';

describe('Auth Integration Tests', () => {
  let app: INestApplication;
  let moduleFixture: TestingModule;

  beforeAll(async () => {
    const setup = await IntegrationTestSetup.createTestAppWithDatabase();
    app = setup.app;
    moduleFixture = setup.moduleFixture;

    // Seed test data
    await IntegrationTestSetup.seedTestData(moduleFixture);
  });

  afterAll(async () => {
    await IntegrationTestSetup.cleanup(app);
  });

  describe('POST /api/v1/auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      // Act
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          userName: 'testuser1',
          password: 'plainpassword',
        })
        .expect(200);

      // Assert
      expect(response.body).toEqual({
        statusCode: 200,
        message: 'Login successful',
        data: {
          logged: true,
          token: expect.any(String),
          expiresIn: '15m',
        },
      });
      expect(response.body.data.token).toBeTruthy();
    });

    it('should create new user on first login with valid credentials', async () => {
      // Act
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          userName: 'newuser',
          password: 'newpassword',
        })
        .expect(200);

      // Assert
      expect(response.body).toEqual({
        statusCode: 200,
        message: 'Login successful',
        data: {
          logged: true,
          token: expect.any(String),
          expiresIn: '15m',
        },
      });
    });

    it('should return 401 for invalid credentials', async () => {
      // Act
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          userName: 'testuser1',
          password: 'wrongpassword',
        })
        .expect(401);

      // Assert
      expect(response.body).toEqual({
        statusCode: 401,
        message: 'Invalid credentials',
        error: 'Unauthorized',
      });
    });

    it('should normalize username (trim and lowercase)', async () => {
      // Act
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          userName: '  TestUser1  ',
          password: 'plainpassword',
        })
        .expect(200);

      // Assert
      expect(response.body.statusCode).toBe(200);
      expect(response.body.data.logged).toBe(true);
    });

    it('should return 400 for missing credentials', async () => {
      // Act
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({})
        .expect(400);

      // Assert
      expect(response.body.statusCode).toBe(400);
    });

    it('should return 400 for invalid input format', async () => {
      // Act
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          userName: 123,
          password: 'password',
        })
        .expect(400);

      // Assert
      expect(response.body.statusCode).toBe(400);
    });
  });

  describe('JWT Token Validation', () => {
    let validToken: string;

    beforeAll(async () => {
      const response = await request(app.getHttpServer()).post('/api/v1/auth/login').send({
        userName: 'testuser1',
        password: 'plainpassword',
      });
      validToken = response.body.data.token;
    });

    it('should accept valid JWT token in Authorization header', async () => {
      // Act
      const response = await request(app.getHttpServer())
        .get('/api/v1/products/by-name')
        .query({ name: 'test', page: 1, limit: 10 })
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);

      // Assert
      expect(response.body.statusCode).toBe(200);
    });

    it('should reject invalid JWT token', async () => {
      // Act
      const response = await request(app.getHttpServer())
        .get('/api/v1/products/by-name')
        .query({ name: 'test', page: 1, limit: 10 })
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      // Assert
      expect(response.body.statusCode).toBe(401);
    });

    it('should reject request without Authorization header', async () => {
      // Act
      const response = await request(app.getHttpServer())
        .get('/api/v1/products/by-name')
        .query({ name: 'test', page: 1, limit: 10 })
        .expect(401);

      // Assert
      expect(response.body.statusCode).toBe(401);
    });
  });
});
