import {
  BadRequestException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository, SelectQueryBuilder } from 'typeorm';
import { Product } from './entities/product.entity';
import { IReponsesDefault } from 'config/response.interface';
import { PercentActiveDto } from './dto/percent-active.dto';

type PaginatedMeta = { page: number; limit: number; totalItems: number; totalPages: number };

type ActivePercentFilters = {
  hasPrice?: 'with' | 'without' | 'any';
  from?: string;
  to?: string;
  dateField?: 'created' | 'updated';
};

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  // ---------- Helpers de dominio / defensa de entradas ----------
  private normalizePagination(
    page?: number,
    limit?: number,
    defaults = { page: 1, limit: 5 },
  ): { page: number; limit: number } {
    const pNum = Number(page);
    const lNum = Number(limit);
    const p = Number.isFinite(pNum) && pNum >= 1 ? Math.trunc(pNum) : defaults.page;
    const l = Number.isFinite(lNum) && lNum >= 1 ? Math.trunc(lNum) : defaults.limit;
    return { page: p, limit: l };
  }

  private ensureNonEmpty(value: string | undefined | null, field: string) {
    if (!value || !value.trim()) {
      throw new BadRequestException(`El parámetro "${field}" es requerido`);
    }
  }

  private ensureNonNegative(n: number | undefined, field: string) {
    if (n !== undefined && n < 0) {
      throw new BadRequestException(`"${field}" debe ser >= 0`);
    }
  }

  private ensureMinLEQMax(min?: number, max?: number) {
    if (min !== undefined && max !== undefined && min > max) {
      throw new BadRequestException('"minPrice" debe ser <= "maxPrice"');
    }
  }

  private meta(page: number, limit: number, totalItems: number): PaginatedMeta {
    return {
      page,
      limit,
      totalItems,
      totalPages: Math.max(1, Math.ceil(totalItems / limit)),
    };
  }

  // ---------- Filtros comunes para % activos con filtros ----------
  private applyActiveFilters(qb: SelectQueryBuilder<Product>, f: ActivePercentFilters) {
    const dateProp = f.dateField === 'created' ? 'p.createdAt' : 'p.updatedAt';

    if (f.hasPrice === 'with') qb.andWhere('p.price IS NOT NULL AND p.price > 0');
    else if (f.hasPrice === 'without') qb.andWhere('(p.price IS NULL OR p.price = 0)');

    if (f.from) qb.andWhere(`${dateProp} >= :fromISO`, { fromISO: this.toISOStart(f.from) });
    if (f.to)
      qb.andWhere(`${dateProp} < :toISOExclusive`, {
        toISOExclusive: this.toISOEndExclusive(f.to),
      });
  }

  private toISOStart(ymd: string): string {
    const [y, m, d] = ymd.split('-').map((n) => parseInt(n, 10));
    const date = new Date(Date.UTC(y, m - 1, d, 0, 0, 0, 0));
    return date.toISOString();
  }

  private toISOEndExclusive(ymd: string): string {
    const [y, m, d] = ymd.split('-').map((n) => parseInt(n, 10));
    const date = new Date(Date.UTC(y, m - 1, d, 0, 0, 0, 0));
    date.setUTCDate(date.getUTCDate() + 1); // +1 día
    return date.toISOString();
  }

  // ------------------------- Casos de uso -------------------------

  async findByName(params: {
    name: string;
    page: number;
    limit: number;
  }): Promise<IReponsesDefault<Product[]> & { meta: PaginatedMeta }> {
    const { name } = params;
    const { page, limit } = this.normalizePagination(params.page, params.limit);

    this.ensureNonEmpty(name, 'name');
    const term = name.trim();

    try {
      const qb = this.productRepo
        .createQueryBuilder('p')
        .where({ isDeleted: false })
        .andWhere({ name: ILike(`%${term}%`) })
        .orderBy('p.createdAt', 'DESC')
        .addOrderBy('p.id', 'DESC')
        .skip((page - 1) * limit)
        .take(limit);

      const [items, totalItems] = await qb.getManyAndCount();

      this.logger.log(`findByName: "${term}", page=${page}, limit=${limit}, total=${totalItems}`);

      return {
        statusCode: HttpStatus.OK,
        message: 'Products retrieved successfully',
        data: items,
        meta: this.meta(page, limit, totalItems),
      };
    } catch (error) {
      this.logger.error('Failed to fetch products by name', error as Error);
      throw new InternalServerErrorException('Failed to retrieve products by name');
    }
  }

  async findByCategory(params: {
    category: string;
    page: number;
    limit: number;
  }): Promise<IReponsesDefault<Product[]> & { meta: PaginatedMeta }> {
    const { category } = params;
    const { page, limit } = this.normalizePagination(params.page, params.limit);

    this.ensureNonEmpty(category, 'category');
    const term = category.trim();

    try {
      const qb = this.productRepo
        .createQueryBuilder('p')
        .where({ isDeleted: false })
        .andWhere({ category: ILike(`%${term}%`) })
        .orderBy('p.createdAt', 'DESC')
        .addOrderBy('p.id', 'DESC')
        .skip((page - 1) * limit)
        .take(limit);

      const [items, totalItems] = await qb.getManyAndCount();

      this.logger.log(
        `findByCategory: "${term}", page=${page}, limit=${limit}, total=${totalItems}`,
      );

      return {
        statusCode: HttpStatus.OK,
        message: 'Products retrieved successfully',
        data: items,
        meta: this.meta(page, limit, totalItems),
      };
    } catch (error) {
      this.logger.error('Failed to fetch products by category', error as Error);
      throw new InternalServerErrorException('Failed to retrieve products by category');
    }
  }

  async findByPriceRange(params: {
    minPrice?: number;
    maxPrice?: number;
    page: number;
    limit: number;
  }): Promise<IReponsesDefault<Product[]> & { meta: PaginatedMeta }> {
    const { minPrice, maxPrice } = params;
    const { page, limit } = this.normalizePagination(params.page, params.limit);

    this.ensureNonNegative(minPrice, 'minPrice');
    this.ensureNonNegative(maxPrice, 'maxPrice');
    this.ensureMinLEQMax(minPrice, maxPrice);

    try {
      const qb = this.productRepo.createQueryBuilder('p').where({ isDeleted: false });

      if (minPrice !== undefined) qb.andWhere('p.price >= :minPrice', { minPrice });
      if (maxPrice !== undefined) qb.andWhere('p.price <= :maxPrice', { maxPrice });

      qb.orderBy('p.createdAt', 'DESC')
        .addOrderBy('p.id', 'DESC')
        .skip((page - 1) * limit)
        .take(limit);

      const [items, totalItems] = await qb.getManyAndCount();

      this.logger.log(
        `findByPriceRange: min=${minPrice ?? '-'} max=${maxPrice ?? '-'}, page=${page}, limit=${limit}, total=${totalItems}`,
      );

      return {
        statusCode: HttpStatus.OK,
        message: 'Products retrieved successfully',
        data: items,
        meta: this.meta(page, limit, totalItems),
      };
    } catch (error) {
      this.logger.error('Failed to fetch products by price range', error as Error);
      throw new InternalServerErrorException('Failed to retrieve products by price range');
    }
  }

  async getPercentDeleted(): Promise<IReponsesDefault<{ percentDeleted: string }>> {
    try {
      const raw = await this.productRepo
        .createQueryBuilder('p')
        .select('COUNT(*)', 'total')
        .addSelect(`SUM(CASE WHEN p.is_deleted = TRUE THEN 1 ELSE 0 END)`, 'deleted')
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
    } catch (error) {
      this.logger.error('Failed to compute percent deleted', error as Error);
      throw new InternalServerErrorException('Failed to compute percent deleted');
    }
  }

  async getPercentActive(
    params: PercentActiveDto,
  ): Promise<
    IReponsesDefault<{ percentActive: string; counts: { active: number; total: number } }>
  > {
    try {
      const { hasPrice = 'any', dateField = 'updated', from, to } = params;

      if (from && to && from > to) {
        throw new BadRequestException('"from" no puede ser mayor que "to"');
      }

      const dateProp = dateField === 'created' ? 'p.createdAt' : 'p.updatedAt';
      const { fromISO, toISOExclusive } = this.buildDateRange({ from, to });

      const qb = this.productRepo.createQueryBuilder('p').select('COUNT(*)', 'total');

      if (fromISO) qb.andWhere(`${dateProp} >= :fromISO`, { fromISO });
      if (toISOExclusive) qb.andWhere(`${dateProp} < :toISOExclusive`, { toISOExclusive });

      if (hasPrice === 'with') {
        qb.andWhere('p.price IS NOT NULL AND p.price > 0');
      } else if (hasPrice === 'without') {
        qb.andWhere('(p.price IS NULL OR p.price = 0)');
      }

      qb.addSelect(
        `SUM(CASE WHEN (p.deletedAt IS NULL AND (p.isDeleted = FALSE OR p.isDeleted IS NULL)) THEN 1 ELSE 0 END)`,
        'active',
      );

      const raw = await qb.getRawOne<{ total: string; active: string | null }>();
      const total = Number(raw?.total ?? 0);
      const active = Number(raw?.active ?? 0);
      const percent = total > 0 ? Math.round((active / total) * 100) : 0;

      this.logger.log(
        `percentActive=${percent}% (active=${active}, total=${total}, hasPrice=${hasPrice}, dateField=${dateField}, from=${from ?? '-'}, to=${to ?? '-'})`,
      );

      return {
        statusCode: HttpStatus.OK,
        message: 'Active percentage retrieved successfully',
        data: { percentActive: `${percent}%`, counts: { active, total } },
      };
    } catch (error) {
      this.logger.error('Failed to compute percent active', error as Error);
      throw new InternalServerErrorException('Failed to compute percent active');
    }
  }

  async softDeleteBySku(rawSku: string): Promise<IReponsesDefault<null>> {
    this.ensureNonEmpty(rawSku, 'sku');
    const sku = rawSku.trim().toUpperCase();

    try {
      const { affected } = await this.productRepo
        .createQueryBuilder()
        .update(Product)
        .set({ isDeleted: true, deletedAt: () => 'NOW()' })
        .where('"sku" = :sku', { sku })
        .andWhere('"is_deleted" = FALSE')
        .execute();

      if (!affected) {
        this.logger.warn(`softDeleteBySku: "${sku}" not found or already deleted`);
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Product not found or already deleted',
          data: null,
        };
      }

      this.logger.log(`softDeleteBySku: "${sku}" -> deleted`);
      return {
        statusCode: HttpStatus.OK,
        message: 'Product deleted successfully',
        data: null,
      };
    } catch (error) {
      this.logger.error(`Failed to soft-delete by sku "${sku}"`, error as Error);
      throw new InternalServerErrorException('Failed to delete product by sku');
    }
  }

  private buildDateRange({ from, to }: { from?: string; to?: string }): {
    fromISO?: string;
    toISOExclusive?: string;
  } {
    const toPlus1Day = (d: Date) => {
      const copy = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
      copy.setUTCDate(copy.getUTCDate() + 1);
      return copy;
    };

    const parseYmd = (s: string) => {
      const [y, m, d] = s.split('-').map((n) => parseInt(n, 10));
      // Fecha a medianoche UTC
      return new Date(Date.UTC(y, m - 1, d, 0, 0, 0, 0));
    };

    let fromISO: string | undefined;
    let toISOExclusive: string | undefined;

    if (from) {
      fromISO = parseYmd(from).toISOString();
    }

    if (to) {
      toISOExclusive = toPlus1Day(parseYmd(to)).toISOString();
    }

    // Solo from ⇒ to = hoy (exclusive)
    if (from && !to) {
      const now = new Date();
      const todayUTC = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
      );
      toISOExclusive = toPlus1Day(todayUTC).toISOString();
    }

    // Solo to ⇒ dejamos solo límite superior
    return { fromISO, toISOExclusive };
  }
}
