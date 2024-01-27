import { ApiProperty } from '@nestjs/swagger';

export class PaginatorSchema {
  @ApiProperty({
    type: Number,
  })
  'pagesCount': number;

  @ApiProperty({
    type: Number,
  })
  'page': number;

  @ApiProperty({
    type: Number,
  })
  'pageSize': number;

  @ApiProperty({
    type: Number,
  })
  'totalCount': number;
}
