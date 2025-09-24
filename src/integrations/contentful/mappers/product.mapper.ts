import { Product } from 'src/products/entities/product.entity';
import { ContentfulProductFields, ContentfulEntrySys } from '../types/product-fields.type';

const toUpperOrNull = (v?: string | null) => (v ? v.toUpperCase() : null);
const toPriceStringOrNull = (v?: number | null) => (v == null ? null : String(v));
const toFiniteIntOr = (v: unknown, fallback = 0) =>
  typeof v === 'number' && Number.isFinite(v) ? Math.trunc(v) : fallback;
const safeDate = (iso: string): Date => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? new Date() : d;
};

export function mapContentfulToProduct(
  sys: ContentfulEntrySys,
  fields: ContentfulProductFields,
): Partial<Product> {
  return {
    contentful_id: sys.id,
    sku: toUpperOrNull(fields.sku ?? null),
    name: fields.name ?? null,
    brand: fields.brand ?? null,
    model: fields.model ?? null,
    category: fields.category ?? null,
    color: fields.color ?? null,
    price: toPriceStringOrNull(fields.price ?? null),
    currency: fields.currency ?? null,
    stock: toFiniteIntOr(fields.stock, 0),
    createdAt: safeDate(sys.createdAt),
    updatedAt: safeDate(sys.updatedAt),
  };
}
