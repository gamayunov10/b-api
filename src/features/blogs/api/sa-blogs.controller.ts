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
import { ApiBasicAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { BlogsRepository } from '../infrastructure/blogs.repository';
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

import { BlogInputModel } from './models/input/blog-input-model';
import { BlogQueryModel } from './models/input/blog.query.model';

@ApiTags('sa/blogs')
@Controller('sa/blogs')
export class SABlogsController {
  constructor(
    private commandBus: CommandBus,
    private readonly blogsRepository: BlogsRepository,
    private readonly blogsQueryRepository: BlogsQueryRepository,
    private readonly postsQueryRepository: PostsQueryRepository,
  ) {}
  @Get()
  @ApiOperation({
    summary: 'Returns all blogs with paging',
  })
  @ApiBasicAuth('Basic')
  @UseGuards(BasicAuthGuard)
  async findBlogs(@Query() query: BlogQueryModel) {
    return this.blogsQueryRepository.findBlogs(query);
  }

  @Get(':id/posts')
  @ApiOperation({
    summary: 'Returns posts for blog with paging and sorting',
  })
  @ApiBasicAuth('Basic')
  @UseGuards(BasicAuthGuard)
  async findPostsByBlogId(
    @Query() query: PostQueryModel,
    @Param('id') blogId: string,
  ) {
    if (isNaN(+blogId)) {
      throw new NotFoundException();
    }

    const blog = await this.blogsQueryRepository.findBlogById(+blogId);

    if (!blog) {
      return exceptionHandler(ResultCode.NotFound, blogNotFound, blogIdField);
    }

    return await this.postsQueryRepository.findPostsByBlogId(query, +blogId);
  }

  @Post()
  @ApiOperation({
    summary: 'Create new blog',
  })
  @ApiBasicAuth('Basic')
  @UseGuards(BasicAuthGuard)
  async createBlog(@Body() blogInputModel: BlogInputModel) {
    const blogId = await this.commandBus.execute(
      new BlogCreateCommand(blogInputModel),
    );

    return this.blogsQueryRepository.findBlogById(blogId);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update existing Blog by id with InputModel',
  })
  @ApiBasicAuth('Basic')
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
  @ApiOperation({
    summary: 'Create new post for specific blog',
  })
  @ApiBasicAuth('Basic')
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

    return this.postsQueryRepository.findPostByPostId(result.response);
  }

  @Put(':blogId/posts/:postId')
  @ApiOperation({
    summary: 'Update existing post by id with InputModel',
  })
  @ApiBasicAuth('Basic')
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
  @ApiOperation({
    summary: 'Delete blog specified by id',
  })
  @ApiBasicAuth('Basic')
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
