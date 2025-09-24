import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.',
  displayName: 'Unit Tests',
  testMatch: ['<rootDir>/src/__tests__/unit/**/*.spec.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.spec.ts',
    '!src/**/*.e2e-spec.ts',
    '!src/**/*.integration.spec.ts',
    '!node_modules/**',
    '!dist/**',
    '!coverage/**',
    '!**/*.module.ts',
    '!**/entities/*.ts',
    '!**/dto/*.ts',
    '!main.ts',
    '!src/test-utils/**',
  ],
  coverageDirectory: './coverage/unit',
  coverageReporters: ['text', 'lcov', 'html'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@test/(.*)$': '<rootDir>/src/__tests__/$1',
    '^@test-utils/(.*)$': '<rootDir>/src/test-utils/$1',
    '^@config/(.*)$': '<rootDir>/config/$1',
    '^@common/(.*)$': '<rootDir>/src/common/$1',
    '^@integrations/(.*)$': '<rootDir>/src/integrations/$1',
    '^@interfaces/(.*)$': '<rootDir>/src/interfaces/$1',
    '^@products/(.*)$': '<rootDir>/src/products/$1',
    '^@auth/(.*)$': '<rootDir>/src/auth/$1',
    '^@users/(.*)$': '<rootDir>/src/users/$1',
  },
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 80,
      functions: 80,
      lines: 80,
    },
  },
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json',
      isolatedModules: true,
    },
  },
  setupFilesAfterEnv: ['<rootDir>/src/test-utils/setup/unit.setup.ts'],
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
};

export default config;
