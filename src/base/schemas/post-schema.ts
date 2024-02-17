import { ApiProperty } from '@nestjs/swagger';

import { PostViewModel } from '../../features/posts/api/models/output/post-view.model';

import { PaginatorSchema } from './paginator.schema';

export class PostSchema extends PaginatorSchema {
  @ApiProperty({
    type: Array(PostViewModel),
  })
  'items': PostViewModel[];
}
