import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

import { SortDirection } from '../../../../../base/enums/sort-direction.enum';
import { QueryGameParams } from '../../../../../base/enums/query-game-params.enum';

export class GameQueryModel {
  @ApiProperty({
    required: false,
    default: QueryGameParams.pairCreatedDate,
    enum: QueryGameParams,
  })
  @IsOptional()
  sortBy = QueryGameParams.pairCreatedDate;

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
