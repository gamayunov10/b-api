import { ApiProperty } from '@nestjs/swagger';

import { BloggerUserViewModel } from '../../features/users/api/models/output/blogger-user-view.model';

import { PaginatorSchema } from './paginator.schema';

export class BloggerUsersSchema extends PaginatorSchema {
  @ApiProperty({
    type: Array(BloggerUserViewModel),
  })
  'items': BloggerUserViewModel[];
}
