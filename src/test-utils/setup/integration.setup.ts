import 'reflect-metadata';

jest.setTimeout(30000);

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

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidJWT(): R;
      toHaveValidResponseStructure(): R;
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

  toHaveValidResponseStructure(received: any) {
    const hasValidStructure =
      received &&
      typeof received === 'object' &&
      'statusCode' in received &&
      'message' in received &&
      typeof received.statusCode === 'number' &&
      typeof received.message === 'string';

    return {
      message: () =>
        hasValidStructure
          ? `Expected response not to have valid structure`
          : `Expected response to have valid structure with statusCode and message`,
      pass: hasValidStructure,
    };
  },
});
