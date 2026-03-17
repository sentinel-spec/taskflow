import { Expose } from 'class-transformer';

export class PaginatedResponseDto<T> {
  @Expose()
  data: T[];

  @Expose()
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
