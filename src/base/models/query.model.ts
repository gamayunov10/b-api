import { IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { QueryParamsEnum } from '../enums/query-params.enum';
import { SortDirection } from '../enums/sort-direction.enum';

export class QueryModel {
  @ApiProperty({
    required: false,
    default: QueryParamsEnum.createdAt,
    enum: QueryParamsEnum,
  })
  @IsOptional()
  sortBy = QueryParamsEnum.createdAt;

  @ApiProperty({
    required: false,
    default: SortDirection.DESC,
    enum: SortDirection,
  })
  @IsOptional()
  sortDirection = SortDirection.DESC;

  @ApiProperty({ type: Number, required: false, default: 1 })
  @IsOptional()
  pageNumber = 1;

  @ApiProperty({ type: Number, required: false, default: 10 })
  @IsOptional()
  pageSize = 10;
}
