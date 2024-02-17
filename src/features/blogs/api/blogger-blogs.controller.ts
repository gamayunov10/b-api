import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiTags } from '@nestjs/swagger';

import { BlogsQueryRepository } from '../infrastructure/blogs.query.repository';
import { BlogCreateCommand } from '../application/usecases/create-blog.usecase';
import { exceptionHandler } from '../../../infrastructure/exception-filters/exception.handler';
import { ResultCode } from '../../../base/enums/result-code.enum';
import { PostsQueryRepository } from '../../posts/infrastructure/posts.query.repository';
import { SwaggerOptions } from '../../../infrastructure/decorators/swagger';
import { JwtBearerGuard } from '../../auth/guards/jwt-bearer.guard';
import { UserIdFromGuard } from '../../auth/decorators/user-id-from-guard.guard.decorator';
import {
  blogIdField,
  blogNotFound,
  userIdField,
  userNotFound,
} from '../../../base/constants/constants';
import { ErrorsMessages } from '../../../base/schemas/api-errors-messages.schema';
import { BlogUpdateCommand } from '../application/usecases/update-blog.usecase';
import { BlogDeleteCommand } from '../application/usecases/delete-blog.usecase';
import { Role } from '../../../base/enums/roles.enum';
import { BlogSchema } from '../../../base/schemas/blog-schema';
import { PostViewModel } from '../../posts/api/models/output/post-view.model';
import { PostInputModel } from '../../posts/api/models/input/post-input-model';
import { PostCreatePostForSpecificBlogCommand } from '../../posts/application/usecases/create-post-for-specific-blog.usecase';
import { PostUpdatePostForSpecificBlogCommand } from '../../posts/application/usecases/update-post-for-specific-blog.usecase';
import { PostQueryModel } from '../../posts/api/models/input/post.query.model';
import { PostDeleteCommand } from '../../posts/application/usecases/delete-post.usecase';

import { BlogQueryModel } from './models/input/blog.query.model';
import { BlogViewModel } from './models/output/blog-view.model';
import { BlogInputModel } from './models/input/blog-input-model';

@ApiTags('blogger/blogs')
@Controller('blogger/blogs')
export class BloggerBlogsController {
  constructor(
    private commandBus: CommandBus,
    private readonly blogsQueryRepository: BlogsQueryRepository,
    private readonly postsQueryRepository: PostsQueryRepository,
  ) {}

  @Get()
  @SwaggerOptions(
    'Returns blogs (for which current user is owner) with paging',
    true,
    false,
    200,
    'Success',
    BlogSchema,
    false,
    false,
    true,
    false,
    false,
    false,
  )
  @UseGuards(JwtBearerGuard)
  async findBlogs(
    @Query() query: BlogQueryModel,
    @UserIdFromGuard() userId: string,
  ) {
    if (isNaN(+userId)) {
      throw new UnauthorizedException();
    }

    return this.blogsQueryRepository.findBlogsByOwnerId(query, +userId);
  }

  @Get(':blogId/posts')
  @SwaggerOptions(
    'Returns posts for blog with paging and sorting',
    true,
    false,
    200,
    'Success',
    PostViewModel,
    false,
    false,
    true,
    true,
    true,
    false,
  )
  @UseGuards(JwtBearerGuard)
  async findPostsByBlogId(
    @Query() query: PostQueryModel,
    @Param('blogId') blogId: string,
    @UserIdFromGuard('id') userId: string,
  ) {
    if (isNaN(+blogId)) {
      throw new NotFoundException();
    }

    if (isNaN(+userId)) {
      throw new UnauthorizedException();
    }

    const blog = await this.blogsQueryRepository.findBlogWithOwner(+blogId);

    if (!blog) {
      return exceptionHandler(ResultCode.NotFound, blogNotFound, blogIdField);
    }

    return await this.postsQueryRepository.findPostsByBlogId(
      query,
      +blogId,
      +userId,
    );
  }

  @Post()
  @SwaggerOptions(
    'Create new blog',
    true,
    false,
    201,
    'Returns the newly created blog',
    BlogViewModel,
    true,
    ErrorsMessages,
    true,
    false,
    false,
    false,
  )
  @UseGuards(JwtBearerGuard)
  async createBlog(
    @Body() blogInputModel: BlogInputModel,
    @UserIdFromGuard() userId: string,
  ): Promise<void | BlogViewModel> {
    const blogId = await this.commandBus.execute(
      new BlogCreateCommand(blogInputModel, userId),
    );

    if (!blogId) {
      return exceptionHandler(ResultCode.NotFound, userNotFound, userIdField);
    }

    return this.blogsQueryRepository.findBlogById(blogId);
  }

  @Put(':id')
  @SwaggerOptions(
    'Update existing Blog by id with InputModel',
    true,
    false,
    204,
    'No Content',
    false,
    true,
    ErrorsMessages,
    true,
    "If user try to update blog that doesn't belong to current user",
    false,
    false,
  )
  @UseGuards(JwtBearerGuard)
  @HttpCode(204)
  async updateBlog(
    @Body() blogInputModel: BlogInputModel,
    @Param('id') blogId: string,
    @UserIdFromGuard() userId: string,
  ): Promise<void> {
    const result = await this.commandBus.execute(
      new BlogUpdateCommand(blogInputModel, blogId, userId),
    );

    if (result.code !== ResultCode.Success) {
      return exceptionHandler(result.code, result.message, result.field);
    }

    return result;
  }

  @Post(':blogId/posts')
  @SwaggerOptions(
    'Create new post for specific blog',
    true,
    false,
    201,
    'Returns the newly created post',
    PostViewModel,
    'If the inputModel has incorrect values',
    ErrorsMessages,
    true,
    "If user try to add post to blog that doesn't belong to current user",
    "If specific blog doesn't exists",
    false,
  )
  @UseGuards(JwtBearerGuard)
  async createPostForSpecificBlog(
    @Param('blogId') blogId: string,
    @Body() postInputModel: PostInputModel,
    @UserIdFromGuard() userId: string,
  ) {
    const result = await this.commandBus.execute(
      new PostCreatePostForSpecificBlogCommand(
        postInputModel,
        blogId,
        userId,
        Role.BLOGGER,
      ),
    );

    if (result.code !== ResultCode.Success) {
      return exceptionHandler(result.code, result.message, result.field);
    }

    return this.postsQueryRepository.findNewlyCreatedPost(result.response);
  }

  @Put(':blogId/posts/:postId')
  @SwaggerOptions(
    'Update existing post by id with InputModel',
    true,
    false,
    204,
    'No Content',
    false,
    'If the inputModel has incorrect values',
    ErrorsMessages,
    true,
    "If user try to update post that belongs to blog that doesn't belong to current user",
    true,
    false,
  )
  @UseGuards(JwtBearerGuard)
  @HttpCode(204)
  async updatePost(
    @Param('blogId') blogId: string,
    @Param('postId') postId: string,
    @Body() postInputModel: PostInputModel,
    @UserIdFromGuard() userId: string,
  ) {
    const result = await this.commandBus.execute(
      new PostUpdatePostForSpecificBlogCommand(
        postInputModel,
        blogId,
        postId,
        userId,
        Role.BLOGGER,
      ),
    );

    if (result.code !== ResultCode.Success) {
      return exceptionHandler(result.code, result.message, result.field);
    }

    return result;
  }

  @Delete(':id')
  @SwaggerOptions(
    'Delete blog specified by id',
    true,
    false,
    204,
    'No Content',
    false,
    false,
    false,
    true,
    true,
    true,
    false,
  )
  @UseGuards(JwtBearerGuard)
  @HttpCode(204)
  async deleteBlog(
    @Param('id') blogId: string,
    @UserIdFromGuard() userId: string,
  ): Promise<void> {
    const result = await this.commandBus.execute(
      new BlogDeleteCommand(blogId, userId, Role.BLOGGER),
    );

    if (result.code !== ResultCode.Success) {
      return exceptionHandler(result.code, result.message, result.field);
    }

    return result;
  }

  @Delete(':blogId/posts/:postId')
  @SwaggerOptions(
    'Delete post specified by id',
    true,
    false,
    204,
    'No Content',
    false,
    false,
    false,
    true,
    true,
    true,
    false,
  )
  @UseGuards(JwtBearerGuard)
  @HttpCode(204)
  async deletePost(
    @Param('blogId') blogId: string,
    @Param('postId') postId: string,
    @UserIdFromGuard() userId: string,
  ) {
    const result = await this.commandBus.execute(
      new PostDeleteCommand(blogId, postId, userId, Role.BLOGGER),
    );

    if (result.code !== ResultCode.Success) {
      return exceptionHandler(result.code, result.message, result.field);
    }

    return result;
  }
}
