import { Controller } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiTags } from '@nestjs/swagger';

import { PostsRepository } from '../infrastructure/posts.repository';
import { PostsQueryRepository } from '../infrastructure/posts.query.repository';

@ApiTags('sa/blogs')
@Controller('sa/blogs')
export class PostsController {
  constructor(
    private commandBus: CommandBus,
    private readonly postsRepository: PostsRepository,
    private readonly postsQueryRepository: PostsQueryRepository,
  ) {}
}
