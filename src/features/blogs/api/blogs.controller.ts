import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { BlogsRepository } from '../infrastructure/blogs.repository';
import { BlogsQueryRepository } from '../infrastructure/blogs.query.repository';
import { PostsQueryRepository } from '../../posts/infrastructure/posts.query.repository';
import { exceptionHandler } from '../../../infrastructure/exception-filters/exception.handler';
import { ResultCode } from '../../../base/enums/result-code.enum';
import { blogIdField, blogNotFound } from '../../../base/constants/constants';
import { UserIdFromHeaders } from '../../auth/decorators/user-id-from-headers.decorator';
import { UsersQueryRepository } from '../../users/infrastructure/users.query.repository';

import { SABlogQueryModel } from './models/input/sa-blog.query.model';
import { BlogQueryModel } from './models/input/blog.query.model';

@ApiTags('blogs')
@Controller('blogs')
export class BlogsController {
  constructor(
    private commandBus: CommandBus,
    private readonly blogsRepository: BlogsRepository,
    private readonly blogsQueryRepository: BlogsQueryRepository,
    private readonly postsQueryRepository: PostsQueryRepository,
    private readonly usersQueryRepository: UsersQueryRepository,
  ) {}
  @Get()
  @ApiOperation({
    summary: 'Returns blogs with paging',
  })
  async findBlogs(@Query() query: BlogQueryModel) {
    return this.blogsQueryRepository.findBlogs(query);
  }

  @Get(':id/posts')
  @ApiOperation({
    summary: 'Returns all posts for specified blog',
  })
  async findPostsByBlogId(
    @Query() query: SABlogQueryModel,
    @Param('id') blogId: string,
    @UserIdFromHeaders('id') userId: string,
  ) {
    if (isNaN(+blogId)) {
      throw new NotFoundException();
    }

    const blog = await this.blogsQueryRepository.findBlogById(+blogId);

    if (!blog) {
      return exceptionHandler(ResultCode.NotFound, blogNotFound, blogIdField);
    }

    const user = await this.usersQueryRepository.findUserByIdBool(+userId);

    let checkedUserId = null;
    if (user) {
      checkedUserId = +userId;
    }

    return await this.postsQueryRepository.findPostsByBlogId(
      query,
      +blogId,
      checkedUserId,
    );
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Returns blog by id',
  })
  async findBlogById(@Param('id') blogId: string) {
    if (isNaN(+blogId)) {
      throw new NotFoundException();
    }

    const result = await this.blogsQueryRepository.findBlogById(+blogId);

    if (!result) {
      return exceptionHandler(ResultCode.NotFound, blogNotFound, blogIdField);
    }

    return result;
  }
}
