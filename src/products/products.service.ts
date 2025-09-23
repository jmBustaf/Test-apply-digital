import {
  Injectable,
  InternalServerErrorException,
  HttpStatus,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository, SelectQueryBuilder } from 'typeorm';
import { Product } from './entities/product.entity';
import { IReponsesDefault, PaginatedMeta } from 'config/response.interface';
import { PercentActiveDto, PriceFlag, DateField } from './dto/percent-active.dto';
import {
  ymdToUtcStart,
  ymdToUtcEndExclusive,
  todayUtcEndExclusive,
} from '../common/validators/date-range.util';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(@InjectRepository(Product) private readonly productRepository: Repository<Product>) {}

  private meta(page: number, limit: number, totalItems: number): PaginatedMeta {
    return { page, limit, totalItems, totalPages: Math.max(1, Math.ceil(totalItems / limit)) };
  }

  private orderAndPaginate(qb: SelectQueryBuilder<Product>, page: number, limit: number) {
    return qb
      .orderBy('p."created_at"', 'DESC')
      .addOrderBy('p."id"', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);
  }

  async findByName(params: {
    name: string;
    page: number;
    limit: number;
  }): Promise<IReponsesDefault<Product[]>> {
    const { name, page, limit } = params;

    try {
      const qb = this.productRepository
        .createQueryBuilder('p')
        .where({ isDeleted: false })
        .andWhere({ name: ILike(`%${name.trim()}%`) });

      this.orderAndPaginate(qb, page, limit);
      const [items, totalItems] = await qb.getManyAndCount();

      this.logger.log(`findByName: "${name}", page=${page}, limit=${limit}, total=${totalItems}`);
      return {
        statusCode: HttpStatus.OK,
        message: 'Products retrieved successfully',
        data: items,
        meta: this.meta(page, limit, totalItems),
      };
    } catch (err) {
      this.logger.error('findByName failed', err as Error);
      throw new InternalServerErrorException('Failed to retrieve products by name');
    }
  }

  async findByCategory(params: {
    category: string;
    page: number;
    limit: number;
  }): Promise<IReponsesDefault<Product[]>> {
    const { category, page, limit } = params;

    try {
      const qb = this.productRepository
        .createQueryBuilder('p')
        .where({ isDeleted: false })
        .andWhere({ category: ILike(`%${category.trim()}%`) });

      this.orderAndPaginate(qb, page, limit);
      const [items, totalItems] = await qb.getManyAndCount();

      this.logger.log(
        `findByCategory: "${category}", page=${page}, limit=${limit}, total=${totalItems}`,
      );
      return {
        statusCode: HttpStatus.OK,
        message: 'Products retrieved successfully',
        data: items,
        meta: this.meta(page, limit, totalItems),
      };
    } catch (err) {
      this.logger.error('findByCategory failed', err as Error);
      throw new InternalServerErrorException('Failed to retrieve products by category');
    }
  }

  async findByPriceRange(params: {
    minPrice?: number;
    maxPrice?: number;
    page: number;
    limit: number;
  }): Promise<IReponsesDefault<Product[]>> {
    const { minPrice, maxPrice, page, limit } = params;

    try {
      const qb = this.productRepository.createQueryBuilder('p').where({ isDeleted: false });
      if (minPrice != null) qb.andWhere('p."price" >= :minPrice', { minPrice });
      if (maxPrice != null) qb.andWhere('p."price" <= :maxPrice', { maxPrice });

      this.orderAndPaginate(qb, page, limit);
      const [items, totalItems] = await qb.getManyAndCount();

      this.logger.log(
        `findByPriceRange: min=${minPrice ?? '-'} 
        max=${maxPrice ?? '-'}, 
        page=${page}, 
        limit=${limit}, 
        total=${totalItems}`,
      );
      return {
        statusCode: HttpStatus.OK,
        message: 'Products retrieved successfully',
        data: items,
        meta: this.meta(page, limit, totalItems),
      };
    } catch (err) {
      this.logger.error('findByPriceRange failed', err as Error);
      throw new InternalServerErrorException('Failed to retrieve products by price range');
    }
  }

  async getPercentDeleted(): Promise<IReponsesDefault<{ percentDeleted: string }>> {
    try {
      const raw = await this.productRepository
        .createQueryBuilder('p')
        .withDeleted()
        .select('COUNT(*)', 'total')
        .addSelect(
          `SUM(CASE WHEN (p."is_deleted" = TRUE OR p."deleted_at" IS NOT NULL) THEN 1 ELSE 0 END)`,
          'deleted',
        )
        .getRawOne<{ total: string; deleted: string | null }>();

      const total = Number(raw?.total ?? 0);
      const deleted = Number(raw?.deleted ?? 0);
      const percent = total > 0 ? Math.round((deleted / total) * 100) : 0;

      this.logger.log(`percentDeleted=${percent}% (deleted=${deleted}, total=${total})`);
      return {
        statusCode: HttpStatus.OK,
        message: 'Deleted percentage retrieved successfully',
        data: { percentDeleted: `${percent}%` },
      };
    } catch (err) {
      this.logger.error('percentDeleted failed', err as Error);
      throw new InternalServerErrorException('Failed to compute percent deleted');
    }
  }

  async getPercentActive(
    dto: PercentActiveDto,
  ): Promise<
    IReponsesDefault<{ percentActive: string; counts: { active: number; total: number } }>
  > {
    try {
      const dateCol = dto.dateField === DateField.CREATED ? 'p."created_at"' : 'p."updated_at"';

      const fromISO = dto.from ? ymdToUtcStart(dto.from).toISOString() : undefined;
      let toISOExclusive = dto.to ? ymdToUtcEndExclusive(dto.to).toISOString() : undefined;
      if (dto.from && !dto.to) toISOExclusive = todayUtcEndExclusive().toISOString();

      const qb = this.productRepository
        .createQueryBuilder('p')
        .withDeleted()
        .select('COUNT(*)', 'total');

      if (fromISO) qb.andWhere(`${dateCol} >= :fromISO`, { fromISO });
      if (toISOExclusive) qb.andWhere(`${dateCol} < :toISOExclusive`, { toISOExclusive });

      if (dto.hasPrice === PriceFlag.WITH) {
        qb.andWhere('p."price" IS NOT NULL AND p."price" > 0');
      } else if (dto.hasPrice === PriceFlag.WITHOUT) {
        qb.andWhere('(p."price" IS NULL OR p."price" = 0)');
      }

      qb.addSelect(
        `SUM(
          CASE 
            WHEN (p."deleted_at" IS NULL AND (p."is_deleted" = FALSE OR p."is_deleted" IS NULL)) 
            THEN 1 ELSE 0 
          END
        )`,
        'active',
      );

      const raw = await qb.getRawOne<{ total: string; active: string | null }>();
      const total = Number(raw?.total ?? 0);
      const active = Number(raw?.active ?? 0);
      const percent = total > 0 ? Math.round((active / total) * 100) : 0;

      this.logger.log(
        `percentActive=${percent}% (
          active=${active}, 
          total=${total}, 
          hasPrice=${dto.hasPrice}, 
          dateField=${dto.dateField}, 
          from=${dto.from ?? '-'}, 
          to=${dto.to ?? '-'})`,
      );

      return {
        statusCode: HttpStatus.OK,
        message: 'Active percentage retrieved successfully',
        data: { percentActive: `${percent}%`, counts: { active, total } },
      };
    } catch (err) {
      this.logger.error('percentActive failed', err as Error);
      throw new InternalServerErrorException('Failed to compute percent active');
    }
  }

  async softDeleteBySku(skuRaw: string): Promise<IReponsesDefault<null>> {
    const sku = skuRaw.trim().toUpperCase();
    if (!sku) throw new NotFoundException('Product not found or already deleted');

    try {
      const { affected } = await this.productRepository
        .createQueryBuilder()
        .update(Product)
        .set({ isDeleted: true, deletedAt: () => 'NOW()' })
        .where('"sku" = :sku', { sku })
        .andWhere('"deleted_at" IS NULL')
        .execute();

      if (!affected) {
        this.logger.warn(`softDeleteBySku: "${sku}" not found or already deleted`);
        throw new NotFoundException('Product not found or already deleted');
      }

      this.logger.log(`softDeleteBySku: "${sku}" -> deleted`);
      return { statusCode: HttpStatus.OK, message: 'Product deleted successfully', data: null };
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      this.logger.error(`softDeleteBySku failed for "${sku}"`, err as Error);
      throw new InternalServerErrorException('Failed to delete product by sku');
    }
  }
}
