import { ApiProperty } from '@nestjs/swagger';

import { BloggerCommentsViewModel } from '../../features/blogs/api/models/output/blogger-comments-view.model';

import { PaginatorSchema } from './paginator.schema';

export class BlogCommentSchema extends PaginatorSchema {
  @ApiProperty({
    type: Array(BloggerCommentsViewModel),
  })
  'items': BloggerCommentsViewModel[];
}
