import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiQuery, ApiTags } from '@nestjs/swagger';

import { BlogsRepository } from '../infrastructure/blogs.repository';
import { BlogsQueryRepository } from '../infrastructure/blogs.query.repository';
import { PostsQueryRepository } from '../../posts/infrastructure/posts.query.repository';
import { exceptionHandler } from '../../../infrastructure/exception-filters/exception.handler';
import { ResultCode } from '../../../base/enums/result-code.enum';
import { blogIdField, blogNotFound } from '../../../base/constants/constants';
import { UserIdFromHeaders } from '../../auth/decorators/user-id-from-headers.decorator';
import { UsersQueryRepository } from '../../users/infrastructure/users.query.repository';
import { SwaggerOptions } from '../../../infrastructure/decorators/swagger';

import { SABlogQueryModel } from './models/input/sa-blog.query.model';
import { BlogQueryModel } from './models/input/blog.query.model';
import { BlogViewModel } from './models/output/blog-view.model';

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
  @SwaggerOptions(
    'Returns blogs with paging',
    true,
    false,
    200,
    'Success',
    false,
    false,
    false,
    false,
    false,
    false,
    false,
  )
  @ApiQuery({ type: BlogQueryModel, required: false })
  async findBlogs(@Query() query: BlogQueryModel) {
    return this.blogsQueryRepository.findBlogs(query);
  }

  @Get(':id/posts')
  @SwaggerOptions(
    'Returns all posts for specified blog',
    true,
    false,
    200,
    'Success',
    false,
    false,
    false,
    false,
    false,
    'If specified blog is not exists',
    false,
  )
  @ApiQuery({ type: SABlogQueryModel, required: false })
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
  @SwaggerOptions(
    'Returns blog by id',
    true,
    false,
    200,
    'Success',
    BlogViewModel,
    false,
    false,
    false,
    false,
    true,
    false,
  )
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
