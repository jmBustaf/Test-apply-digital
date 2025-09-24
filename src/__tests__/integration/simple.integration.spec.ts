import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';

describe('Simple Integration Tests', () => {
  let moduleFixture: TestingModule;

  beforeAll(async () => {
    moduleFixture = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
    }).compile();
  });

  afterAll(async () => {
    if (moduleFixture) {
      await moduleFixture.close();
    }
  });

  it('should create the test module', () => {
    expect(moduleFixture).toBeDefined();
  });

  it('should have config module imported', () => {
    const configModule = moduleFixture.get(ConfigModule);
    expect(configModule).toBeDefined();
  });
});
