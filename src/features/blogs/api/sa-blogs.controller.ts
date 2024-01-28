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
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiTags } from '@nestjs/swagger';

import { BasicAuthGuard } from '../../auth/guards/basic-auth.guard';
import { BlogsQueryRepository } from '../infrastructure/blogs.query.repository';
import { BlogCreateCommand } from '../application/usecases/create-blog.usecase';
import { BlogUpdateCommand } from '../application/usecases/update-blog.usecase';
import { exceptionHandler } from '../../../infrastructure/exception-filters/exception.handler';
import { ResultCode } from '../../../base/enums/result-code.enum';
import { blogIdField, blogNotFound } from '../../../base/constants/constants';
import { BlogDeleteCommand } from '../application/usecases/delete-blog.usecase';
import { PostInputModel } from '../../posts/api/models/input/post-input-model';
import { PostCreatePostForSpecificBlogCommand } from '../../posts/application/usecases/create-post-for-specific-blog.usecase';
import { PostsQueryRepository } from '../../posts/infrastructure/posts.query.repository';
import { PostUpdatePostForSpecificBlogCommand } from '../../posts/application/usecases/update-post-for-specific-blog.usecase';
import { PostDeleteCommand } from '../../posts/application/usecases/delete-post.usecase';
import { PostQueryModel } from '../../posts/api/models/input/post.query.model';
import { UserIdFromHeaders } from '../../auth/decorators/user-id-from-headers.decorator';
import { UsersQueryRepository } from '../../users/infrastructure/users.query.repository';
import { SwaggerOptions } from '../../../infrastructure/decorators/swagger';
import { PostViewModel } from '../../posts/api/models/output/post-view.model';
import { ErrorsMessages } from '../../../base/schemas/api-errors-messages.schema';

import { BlogInputModel } from './models/input/blog-input-model';
import { BlogQueryModel } from './models/input/blog.query.model';
import { BlogViewModel } from './models/output/blog-view.model';

@ApiTags('sa/blogs')
@Controller('sa/blogs')
export class SABlogsController {
  constructor(
    private commandBus: CommandBus,
    private readonly blogsQueryRepository: BlogsQueryRepository,
    private readonly postsQueryRepository: PostsQueryRepository,
    private readonly usersQueryRepository: UsersQueryRepository,
  ) {}
  @Get()
  @SwaggerOptions(
    'Returns all blogs with paging',
    false,
    true,
    200,
    'Success',
    false,
    false,
    false,
    true,
    false,
    false,
    false,
  )
  @UseGuards(BasicAuthGuard)
  async findBlogs(@Query() query: BlogQueryModel) {
    return this.blogsQueryRepository.findBlogs(query);
  }

  @Get(':id/posts')
  @SwaggerOptions(
    'Returns posts for blog with paging and sorting',
    false,
    true,
    200,
    'Success',
    PostViewModel,
    false,
    false,
    true,
    false,
    true,
    false,
  )
  @UseGuards(BasicAuthGuard)
  async findPostsByBlogId(
    @Query() query: PostQueryModel,
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

  @Post()
  @SwaggerOptions(
    'Create new blog',
    false,
    true,
    201,
    'Returns the newly created blog',
    BlogViewModel,
    'If the inputModel has incorrect values',
    ErrorsMessages,
    true,
    false,
    false,
    false,
  )
  @UseGuards(BasicAuthGuard)
  async createBlog(@Body() blogInputModel: BlogInputModel) {
    const blogId = await this.commandBus.execute(
      new BlogCreateCommand(blogInputModel),
    );

    return this.blogsQueryRepository.findBlogById(blogId);
  }

  @Put(':id')
  @SwaggerOptions(
    'Update existing Blog by id with InputModel',
    false,
    true,
    204,
    'No Content',
    false,
    'If the inputModel has incorrect values',
    ErrorsMessages,
    true,
    "If user try to update blog that doesn't belong to current user",
    false,
    false,
  )
  @UseGuards(BasicAuthGuard)
  @HttpCode(204)
  async updateBlog(
    @Param('id') blogId: string,
    @Body() blogInputModel: BlogInputModel,
  ) {
    const result = await this.commandBus.execute(
      new BlogUpdateCommand(blogInputModel, blogId),
    );

    if (result.code !== ResultCode.Success) {
      return exceptionHandler(result.code, result.message, result.field);
    }

    return result;
  }

  @Post(':id/posts')
  @SwaggerOptions(
    'Create new post for specific blog',
    false,
    true,
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
  @UseGuards(BasicAuthGuard)
  async createPostForSpecificBlog(
    @Param('id') blogId: string,
    @Body() postInputModel: PostInputModel,
  ) {
    const result = await this.commandBus.execute(
      new PostCreatePostForSpecificBlogCommand(postInputModel, blogId),
    );

    if (result.code !== ResultCode.Success) {
      return exceptionHandler(result.code, result.message, result.field);
    }

    return this.postsQueryRepository.findNewlyCreatedPost(result.response);
  }

  @Put(':blogId/posts/:postId')
  @SwaggerOptions(
    'Update existing post by id with InputModel',
    false,
    true,
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
  @UseGuards(BasicAuthGuard)
  @HttpCode(204)
  async updatePost(
    @Param('blogId') blogId: string,
    @Param('postId') postId: string,
    @Body() postInputModel: PostInputModel,
  ) {
    const result = await this.commandBus.execute(
      new PostUpdatePostForSpecificBlogCommand(postInputModel, blogId, postId),
    );

    if (result.code !== ResultCode.Success) {
      return exceptionHandler(result.code, result.message, result.field);
    }

    return result;
  }

  @Delete(':id')
  @SwaggerOptions(
    'Delete blog specified by id',
    false,
    true,
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
  @UseGuards(BasicAuthGuard)
  @HttpCode(204)
  async deleteBlog(@Param('id') blogId: string) {
    const result = await this.commandBus.execute(new BlogDeleteCommand(blogId));

    if (!result) {
      return exceptionHandler(ResultCode.NotFound, blogNotFound, blogIdField);
    }

    return result;
  }

  @Delete(':blogId/posts/:postId')
  @SwaggerOptions(
    'Delete post specified by id',
    false,
    true,
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
  @UseGuards(BasicAuthGuard)
  @HttpCode(204)
  async deletePost(
    @Param('blogId') blogId: string,
    @Param('postId') postId: string,
  ) {
    const result = await this.commandBus.execute(
      new PostDeleteCommand(blogId, postId),
    );

    if (result.code !== ResultCode.Success) {
      return exceptionHandler(result.code, result.message, result.field);
    }

    return result;
  }
}
