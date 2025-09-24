import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContentfulClientApi, EntrySkeletonType } from 'contentful';
import { ConfigService } from '@nestjs/config';
import { CONTENTFUL_CLIENT } from './contentful.module';
import { Product } from 'src/products/entities/product.entity';
import { mapContentfulToProduct } from './mappers/product.mapper';
import { ContentfulProductFields } from './types/product-fields.type';

type CFClient = ContentfulClientApi<undefined>;

const PAGE_SIZE = 100;
type AllowedOrder =
  | 'sys.createdAt'
  | '-sys.createdAt'
  | 'sys.updatedAt'
  | '-sys.updatedAt'
  | 'sys.contentType.sys.id'
  | '-sys.contentType.sys.id';
const ORDER: AllowedOrder[] = ['sys.createdAt'];
const DEFAULT_CONTENT_TYPE_PRODUCT = 'product' as const;

interface ProductSkeleton extends EntrySkeletonType {
  contentTypeId: string;
  fields: ContentfulProductFields;
}

@Injectable()
export class ContentfulService {
  private readonly logger = new Logger(ContentfulService.name);
  private readonly contentType: string;

  constructor(
    @Inject(CONTENTFUL_CLIENT) private readonly cf: CFClient,
    @InjectRepository(Product) private readonly productRepo: Repository<Product>,
    config: ConfigService,
  ) {
    this.contentType = config.get<string>('CONTENT_TYPE_PRODUCT', DEFAULT_CONTENT_TYPE_PRODUCT);
  }

  async syncAll(): Promise<{ total: number; upserts: number; softDeleted: number }> {
    let skip = 0;
    let total = 0;
    let upserts = 0;

    const incomingIds = new Set<string>();
    let fetched = 0;
    let completed = true;

    try {
      while (true) {
        const res = await this.cf.getEntries<ProductSkeleton>({
          content_type: this.contentType,
          skip,
          limit: PAGE_SIZE,
          order: ORDER,
        });

        if (skip === 0) total = res.total;
        fetched += res.items.length;

        const toUpsert = res.items.map((entry) => {
          const partial = mapContentfulToProduct(
            {
              id: entry.sys.id,
              createdAt: entry.sys.createdAt,
              updatedAt: entry.sys.updatedAt,
            },
            entry.fields,
          );
          if (partial.contentful_id) incomingIds.add(partial.contentful_id);
          return partial;
        });

        if (toUpsert.length > 0) {
          const setClause = `
            sku = EXCLUDED.sku,
            name = EXCLUDED.name,
            brand = EXCLUDED.brand,
            model = EXCLUDED.model,
            category = EXCLUDED.category,
            color = EXCLUDED.color,
            price = EXCLUDED.price,
            currency = EXCLUDED.currency,
            stock = EXCLUDED.stock,
            updated_at = EXCLUDED.updated_at
          `;

          const conflictSql = `
            ("contentful_id")
            DO UPDATE SET
              ${setClause}
            WHERE
              products."is_deleted" = FALSE
              AND (
                EXCLUDED."updated_at" IS NULL
                OR products."updated_at" IS NULL
                OR products."updated_at" <= EXCLUDED."updated_at"
              )
          `;

          const result = await this.productRepo
            .createQueryBuilder()
            .insert()
            .into(Product)
            .values(toUpsert)
            .onConflict(conflictSql)
            .returning('id')
            .execute();

          upserts += Array.isArray(result.raw) ? result.raw.length : 0;
        }

        skip += res.items.length;
        const hasMore = skip < res.total && res.items.length > 0;
        if (!hasMore) break;
      }
    } catch (err) {
      completed = false;
      this.logger.error('Contentful sync failed', err as Error);
    }

    let softDeleted = 0;
    if (completed && fetched === total) {
      const qb = this.productRepo
        .createQueryBuilder()
        .update(Product)
        .set({ isDeleted: true, deletedAt: () => 'NOW()' })
        .where('"is_deleted" = FALSE')
        .andWhere('"contentful_id" IS NOT NULL');

      if (incomingIds.size > 0) {
        qb.andWhere('"contentful_id" NOT IN (:...ids)', { ids: Array.from(incomingIds) });
      }

      const { affected } = await qb.execute();
      softDeleted = affected ?? 0;
    } else if (!completed) {
      this.logger.warn('Skipping soft-delete sweep because sync did not complete successfully.');
    } else {
      this.logger.warn(`Skipping soft-delete sweep: fetched=${fetched}, expected=${total}`);
    }

    this.logger.log(
      `Sync Contentful done: total=${total}, upserts=${upserts}, softDeleted=${softDeleted}`,
    );

    return { total, upserts, softDeleted };
  }
}
