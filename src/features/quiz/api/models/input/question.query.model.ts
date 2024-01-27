import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

import { PublishedStatuses } from '../../../../../base/enums/published-statuses';
import { SortDirection } from '../../../../../base/enums/sort-direction.enum';
import { QuestionQueryParams } from '../../../../../base/enums/question-query-params.enum';

export class QuestionQueryModel {
  @ApiProperty({
    required: false,
    default: QuestionQueryParams.createdAt,
    enum: QuestionQueryParams,
  })
  @IsOptional()
  sortBy = QuestionQueryParams.createdAt;

  @ApiProperty({
    required: false,
    default: SortDirection.DESC,
    enum: SortDirection,
  })
  @IsOptional()
  sortDirection = SortDirection.DESC;

  @ApiProperty({ required: false, default: 1 })
  @IsOptional()
  pageNumber = 1;

  @ApiProperty({ required: false, default: 10 })
  @IsOptional()
  pageSize = 10;

  @ApiProperty({
    required: false,
    default: false,
  })
  @Transform(({ value }) => {
    if (value === PublishedStatuses.PUBLISHED) {
      return true;
    }
    if (value === PublishedStatuses.NOT_PUBLISHED) {
      return false;
    }
  })
  @IsOptional()
  publishedStatus: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  bodySearchTerm: string;
}
