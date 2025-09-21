import { HttpStatus, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { IReponsesDefault } from 'config/response.interface';

type PaginatedMeta = { page: number; limit: number; totalItems: number; totalPages: number };

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  async findByName(params: {
    name: string;
    page: number;
    limit: number;
  }): Promise<IReponsesDefault<Product[]> & { meta: PaginatedMeta }> {
    const { name, page, limit } = params;

    try {
      const qb = this.productRepo
        .createQueryBuilder('p')
        .where({ isDeleted: false })
        .andWhere({ name: ILike(`%${name}%`) })
        .orderBy('p.createdAt', 'DESC')
        .addOrderBy('p.id', 'DESC')
        .skip((page - 1) * limit)
        .take(limit);

      const [items, totalItems] = await qb.getManyAndCount();

      this.logger.log(`findByName: "${name}", page=${page}, limit=${limit}, total=${totalItems}`);

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
    const { category, page, limit } = params;

    try {
      const qb = this.productRepo
        .createQueryBuilder('p')
        .where({ isDeleted: false })
        .andWhere({ category: ILike(`%${category}%`) })
        .orderBy('p.createdAt', 'DESC')
        .addOrderBy('p.id', 'DESC')
        .skip((page - 1) * limit)
        .take(limit);

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
    const { minPrice, maxPrice, page, limit } = params;

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

  private meta(page: number, limit: number, totalItems: number): PaginatedMeta {
    return {
      page,
      limit,
      totalItems,
      totalPages: Math.max(1, Math.ceil(totalItems / limit)),
    };
  }
}
