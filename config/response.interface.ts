import { HttpStatus } from '@nestjs/common';

export interface IReponsesDefault<T> {
  statusCode: HttpStatus;
  message: string;
  data?: T;
}
