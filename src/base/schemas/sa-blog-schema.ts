import { ApiProperty } from '@nestjs/swagger';

import { SABlogViewModel } from '../../features/blogs/api/models/output/sa-blog-view.model';

import { PaginatorSchema } from './paginator.schema';

export class SABlogSchema extends PaginatorSchema {
  @ApiProperty({
    type: Array(SABlogViewModel),
  })
  'items': SABlogViewModel[];
}
