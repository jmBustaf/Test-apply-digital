import 'reflect-metadata';
import { resetAllMocks } from '../helpers/test-assertions.helper';

jest.setTimeout(10000);

const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeAll(() => {
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning:') || args[0].includes('DeprecationWarning:'))
    ) {
      return;
    }
    originalConsoleError(...args);
  };

  console.warn = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning:') || args[0].includes('DeprecationWarning:'))
    ) {
      return;
    }
    originalConsoleWarn(...args);
  };
});

afterAll(() => {
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});

beforeEach(() => {
  resetAllMocks();
});

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidJWT(): R;
      toBeValidUUID(): R;
    }
  }
}

expect.extend({
  toBeValidJWT(received: string) {
    const jwtRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/;
    const isValid = typeof received === 'string' && jwtRegex.test(received);

    return {
      message: () =>
        isValid
          ? `Expected ${received} not to be a valid JWT`
          : `Expected ${received} to be a valid JWT`,
      pass: isValid,
    };
  },

  toBeValidUUID(received: string) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const isValid = typeof received === 'string' && uuidRegex.test(received);

    return {
      message: () =>
        isValid
          ? `Expected ${received} not to be a valid UUID`
          : `Expected ${received} to be a valid UUID`,
      pass: isValid,
    };
  },
});
