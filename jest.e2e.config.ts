import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.',
  displayName: 'E2E Tests',
  testMatch: ['<rootDir>/test/e2e/**/*.e2e-spec.ts'],
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
  coverageDirectory: './coverage/e2e',
  coverageReporters: ['text', 'lcov', 'html'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@test/(.*)$': '<rootDir>/test/$1',
    '^@test-utils/(.*)$': '<rootDir>/src/test-utils/$1',
    '^@config/(.*)$': '<rootDir>/config/$1',
    '^@common/(.*)$': '<rootDir>/src/common/$1',
    '^@integrations/(.*)$': '<rootDir>/src/integrations/$1',
    '^@interfaces/(.*)$': '<rootDir>/src/interfaces/$1',
    '^@products/(.*)$': '<rootDir>/src/products/$1',
    '^@auth/(.*)$': '<rootDir>/src/auth/$1',
    '^@users/(.*)$': '<rootDir>/src/users/$1',
    '^config/(.*)$': '<rootDir>/config/$1',
  },
  coverageThreshold: {
    global: {
      statements: 60,
      branches: 60,
      functions: 60,
      lines: 60,
    },
  },
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json',
      isolatedModules: true,
    },
  },
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
  testTimeout: 60000,
  maxWorkers: 1,
};

export default config;
