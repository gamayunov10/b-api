import { IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { QueryParamsEnum } from '../enums/query-params.enum';
import { SortDirection } from '../enums/sort-direction.enum';

export class QueryModel {
  @ApiProperty({ required: false })
  @IsOptional()
  sortBy = QueryParamsEnum.createdAt;

  @ApiProperty({ required: false })
  @IsOptional()
  sortDirection = SortDirection.DESC;

  @ApiProperty({ required: false })
  @IsOptional()
  pageNumber = 1;

  @ApiProperty({ required: false })
  @IsOptional()
  pageSize = 10;
}
