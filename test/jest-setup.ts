jest.setTimeout(30000);

jest.mock('contentful', () => {
  return {
    createClient: () => ({
      getEntries: jest.fn().mockResolvedValue({ items: [] }),
    }),
  };
});
