import { Product } from 'src/products/entities/product.entity';
import { ContentfulProductFields, ContentfulEntrySys } from '../types/product-fields.type';

export function mapContentfulToProduct(
  sys: ContentfulEntrySys,
  fields: ContentfulProductFields,
): Partial<Product> {
  return {
    contentful_id: sys.id,
    sku: fields.sku ? fields.sku.toUpperCase() : null,
    name: fields.name ?? null,
    brand: fields.brand ?? null,
    model: fields.model ?? null,
    category: fields.category ?? null,
    color: fields.color ?? null,
    price: fields.price != null ? String(fields.price) : null,
    currency: fields.currency ?? null,
    stock: Number.isFinite(fields.stock) ? (fields.stock as number) : 0,
    createdAt: new Date(sys.createdAt),
    updatedAt: new Date(sys.updatedAt),
  };
}
