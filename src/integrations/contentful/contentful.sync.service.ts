import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContentfulClientApi, Entry, EntrySkeletonType } from 'contentful';
import { CONTENTFUL_CLIENT } from './contentful.module';
import { Product } from 'src/products/entities/product.entity';
import { mapContentfulToProduct } from './mappers/product.mapper';
import { ContentfulProductFields } from './types/product-fields.type';

const CONTENT_TYPE_PRODUCT = 'product' as const;

interface ProductSkeleton extends EntrySkeletonType {
  contentTypeId: typeof CONTENT_TYPE_PRODUCT;
  fields: ContentfulProductFields;
}

type CFClient = ContentfulClientApi<undefined>;

@Injectable()
export class ContentfulSyncService {
  private readonly logger = new Logger(ContentfulSyncService.name);

  constructor(
    @Inject(CONTENTFUL_CLIENT) private readonly cf: CFClient,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  async syncAll(): Promise<{ total: number; upserts: number; softDeleted: number }> {
    const limit = 100;
    let skip = 0;
    let total = 0;
    let upserts = 0;

    const incomingIds = new Set<string>();
    let hasMore = true;

    let fetched = 0;
    let completed = true;

    try {
      while (hasMore) {
        const res = await this.cf.getEntries<ProductSkeleton>({
          content_type: CONTENT_TYPE_PRODUCT,
          skip,
          limit,
          order: ['sys.createdAt'],
        });

        if (skip === 0) total = res.total;
        fetched += res.items.length;

        const toUpsert = res.items.map((entry: Entry<ProductSkeleton, undefined, string>) => {
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
        hasMore = skip < res.total && res.items.length > 0;
      }
    } catch (err) {
      completed = false;
      this.logger.error('Contentful sync failed', err as Error);
    }

    let softDeleted = 0;
    if (completed && fetched === total) {
      if (incomingIds.size > 0) {
        const idsArray = Array.from(incomingIds);
        const { affected } = await this.productRepo
          .createQueryBuilder()
          .update(Product)
          .set({ isDeleted: true, deletedAt: () => 'NOW()' })
          .where('"is_deleted" = FALSE')
          .andWhere('"contentful_id" IS NOT NULL')
          .andWhere('"contentful_id" NOT IN (:...ids)', { ids: idsArray })
          .execute();
        softDeleted = affected ?? 0;
      } else {
        const { affected } = await this.productRepo
          .createQueryBuilder()
          .update(Product)
          .set({ isDeleted: true, deletedAt: () => 'NOW()' })
          .where('"is_deleted" = FALSE')
          .andWhere('"contentful_id" IS NOT NULL')
          .execute();
        softDeleted = affected ?? 0;
      }
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
