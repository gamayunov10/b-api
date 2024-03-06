import {
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiTags } from '@nestjs/swagger';

import { BlogsRepository } from '../infrastructure/blogs.repository';
import { BlogsQueryRepository } from '../infrastructure/blogs.query.repository';
import { PostsQueryRepository } from '../../posts/infrastructure/posts.query.repository';
import { exceptionHandler } from '../../../infrastructure/exception-filters/exception.handler';
import { ResultCode } from '../../../base/enums/result-code.enum';
import { blogIdField, blogNotFound } from '../../../base/constants/constants';
import { UserIdFromHeaders } from '../../auth/decorators/user-id-from-headers.decorator';
import { UsersQueryRepository } from '../../users/infrastructure/users.query.repository';
import { SwaggerOptions } from '../../../infrastructure/decorators/swagger';
import { BlogSchema } from '../../../base/schemas/blog-schema';
import { PostSchema } from '../../../base/schemas/post-schema';
import { JwtBearerGuard } from '../../auth/guards/jwt-bearer.guard';
import { UserIdFromGuard } from '../../auth/decorators/user-id-from-guard.guard.decorator';
import { BlogSubscribeCommand } from '../application/usecases/blog-subscribe.usecase';
import { BlogUnsubscribeCommand } from '../application/usecases/blog-unsubscribe.usecase';

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
    BlogSchema,
    false,
    false,
    false,
    false,
    false,
    false,
  )
  async findBlogs(
    @Query() query: BlogQueryModel,
    @UserIdFromHeaders('id') userId: string,
  ) {
    const user = await this.usersQueryRepository.findUserByIdBool(+userId);

    let checkedUserId = null;
    if (user) {
      checkedUserId = +userId;
    }

    return this.blogsQueryRepository.findBlogs(query, checkedUserId);
  }

  @Get(':blogId/posts')
  @SwaggerOptions(
    'Returns all posts for specified blog',
    true,
    false,
    200,
    'Success',
    PostSchema,
    false,
    false,
    false,
    false,
    'If specified blog is not exists',
    false,
  )
  async findPostsByBlogId(
    @Query() query: SABlogQueryModel,
    @Param('blogId') blogId: string,
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

    return await this.postsQueryRepository.findPostsForBlog(
      query,
      +blogId,
      checkedUserId,
    );
  }

  @Get(':blogId')
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
  async findBlogById(
    @Param('blogId') blogId: string,
    @UserIdFromHeaders('id') userId: string,
  ) {
    if (isNaN(+blogId)) {
      throw new NotFoundException();
    }

    const user = await this.usersQueryRepository.findUserByIdBool(+userId);

    let checkedUserId = null;
    if (user) {
      checkedUserId = +userId;
    }

    const result = await this.blogsQueryRepository.findBlogById(
      +blogId,
      checkedUserId,
    );

    if (!result) {
      return exceptionHandler(ResultCode.NotFound, blogNotFound, blogIdField);
    }

    return result;
  }

  @Post(':blogId/subscription')
  @SwaggerOptions(
    'Subscribe user to blog. Notifications about new posts will be send to Telegram Bot',
    true,
    false,
    204,
    'No Content',
    false,
    false,
    false,
    true,
    false,
    true,
    false,
  )
  @HttpCode(204)
  @UseGuards(JwtBearerGuard)
  async subscription(
    @Param('blogId') blogId: string,
    @UserIdFromGuard() userId: string,
  ) {
    if (isNaN(+blogId)) {
      throw new NotFoundException();
    }

    const result = await this.commandBus.execute(
      new BlogSubscribeCommand(blogId, userId),
    );

    if (result.code !== ResultCode.Success) {
      return exceptionHandler(result.code, result.message, result.field);
    }

    return result;
  }

  @Delete(':id/subscription')
  @SwaggerOptions(
    'Unsubscribe user from blog. Notifications about new posts will not be send to Telegram Bot',
    true,
    false,
    204,
    'No Content',
    false,
    false,
    false,
    true,
    false,
    true,
    false,
  )
  @UseGuards(JwtBearerGuard)
  @HttpCode(204)
  async unsubscribeFromBlog(
    @Param('id') blogId: string,
    @UserIdFromGuard() userId: string,
  ) {
    const result = await this.commandBus.execute(
      new BlogUnsubscribeCommand(blogId, userId),
    );

    if (result.code !== ResultCode.Success) {
      return exceptionHandler(result.code, result.message, result.field);
    }

    return result;
  }
}
