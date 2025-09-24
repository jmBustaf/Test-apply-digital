// service.mock.ts - Mocks especializados para servicios
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';

export class ServiceMockFactory {
  static createConfigService(overrides: Record<string, any> = {}): DeepMockProxy<ConfigService> {
    const mock = mockDeep<ConfigService>();
    mock.get.mockImplementation((key: string, defaultValue?: any) => {
      return overrides[key] ?? defaultValue;
    });
    return mock;
  }

  static createJwtService(): DeepMockProxy<JwtService> {
    return mockDeep<JwtService>();
  }

  static createLogger() {
    return {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      verbose: jest.fn(),
    };
  }
}
