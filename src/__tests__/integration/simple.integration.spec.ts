import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../app.module';

describe('Simple Integration Tests', () => {
  let moduleFixture: TestingModule;

  beforeAll(async () => {
    moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
  });

  afterAll(async () => {
    if (moduleFixture) {
      await moduleFixture.close();
    }
  });

  it('should create the app module', () => {
    expect(moduleFixture).toBeDefined();
  });

  it('should have app module imported', () => {
    const appModule = moduleFixture.get(AppModule);
    expect(appModule).toBeDefined();
  });
});
