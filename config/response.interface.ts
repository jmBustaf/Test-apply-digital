import { HttpStatus } from '@nestjs/common';

export interface PaginatedMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export interface IReponsesDefault<T> {
  statusCode: HttpStatus;
  message: string;
  data?: T;
  meta?: PaginatedMeta;
}
