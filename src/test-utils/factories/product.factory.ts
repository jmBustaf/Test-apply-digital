import { Product } from '../../products/entities/product.entity';
import { PercentActiveDto, PriceFlag, DateField } from '../../products/dto/percent-active.dto';

export class ProductFactory {
  private static idCounter = 1;

  static create(overrides: Partial<Product> = {}): Product {
    const id = `test-product-${this.idCounter++}`;

    return {
      id,
      contentful_id: 'contentful-123',
      sku: 'SKU-123',
      name: 'Test Product',
      brand: 'Test Brand',
      model: 'Test Model',
      category: 'Electronics',
      color: 'Black',
      price: '99.99',
      currency: 'USD',
      stock: 10,
      isDeleted: false,
      deletedAt: null,
      createdAt: new Date('2024-01-01T00:00:00Z'),
      updatedAt: new Date('2024-01-01T00:00:00Z'),
      ...overrides,
    };
  }

  static createDeleted(overrides: Partial<Product> = {}): Product {
    return this.create({
      isDeleted: true,
      deletedAt: new Date('2024-01-02T00:00:00Z'),
      ...overrides,
    });
  }

  static createMany(count: number, overrides: Partial<Product> = {}): Product[] {
    return Array.from({ length: count }, (_, index) =>
      this.create({
        id: `test-product-${index + 1}`,
        sku: `SKU-${index + 1}`,
        name: `Test Product ${index + 1}`,
        ...overrides,
      }),
    );
  }

  static createElectronics(overrides: Partial<Product> = {}): Product {
    return this.create({
      category: 'Electronics',
      brand: 'TechBrand',
      ...overrides,
    });
  }

  static createClothing(overrides: Partial<Product> = {}): Product {
    return this.create({
      category: 'Clothing',
      brand: 'FashionBrand',
      color: 'Blue',
      ...overrides,
    });
  }

  static createWithPrice(
    price: string,
    currency: string = 'USD',
    overrides: Partial<Product> = {},
  ): Product {
    return this.create({
      price,
      currency,
      ...overrides,
    });
  }

  static createOutOfStock(overrides: Partial<Product> = {}): Product {
    return this.create({
      stock: 0,
      ...overrides,
    });
  }

  static createPercentActiveDto(overrides: Partial<PercentActiveDto> = {}): PercentActiveDto {
    return {
      from: '2024-01-01',
      to: '2024-01-31',
      hasPrice: PriceFlag.ANY,
      dateField: DateField.CREATED,
      ...overrides,
    };
  }

  static reset() {
    this.idCounter = 1;
  }
}
