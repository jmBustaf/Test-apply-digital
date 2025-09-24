import { Product } from '../../../../products/entities/product.entity';

describe('ProductEntity', () => {
  it('should be defined', () => {
    expect(new Product()).toBeDefined();
  });
});
