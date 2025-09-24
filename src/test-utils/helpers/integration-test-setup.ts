import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppModule } from '../../app.module';
import { User } from '../../users/entities/user.entity';
import { Product } from '../../products/entities/product.entity';

export class IntegrationTestSetup {
  static async createTestAppWithDatabase(): Promise<{
    app: INestApplication;
    moduleFixture: TestingModule;
  }> {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          cache: false,
          expandVariables: true,
          envFilePath: '.env.test',
        }),
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [User, Product],
          synchronize: true,
          logging: false,
        }),
        AppModule,
      ],
    }).compile();

    const app = moduleFixture.createNestApplication();

    // Apply the same configuration as main.ts
    app.enableCors();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new (await import('@nestjs/common')).ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );

    await app.init();

    return { app, moduleFixture };
  }

  static async cleanup(app: INestApplication): Promise<void> {
    if (app) {
      await app.close();
    }
  }
}
