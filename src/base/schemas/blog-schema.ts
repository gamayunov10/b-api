import { ApiProperty } from '@nestjs/swagger';

import { BlogViewModel } from '../../features/blogs/api/models/output/blog-view.model';

import { PaginatorSchema } from './paginator.schema';

export class BlogSchema extends PaginatorSchema {
  @ApiProperty({
    type: Array(BlogViewModel),
  })
  'items': BlogViewModel[];
}
