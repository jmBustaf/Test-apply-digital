jest.setTimeout(30000);

jest.mock('contentful', () => {
  return {
    createClient: () => ({
      getEntries: jest.fn().mockResolvedValue({ items: [] }),
      // Si tu código usa más métodos, agrégalos aquí:
      // getEntry: jest.fn(),
      // sync: jest.fn(),
    }),
  };
});
