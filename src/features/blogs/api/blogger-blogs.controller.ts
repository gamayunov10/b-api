import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  ParseFilePipe,
  Post,
  Put,
  Query,
  UnauthorizedException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';

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
import { BlogCommentSchema } from '../../../base/schemas/blog-comment-schema';
import { CommentsQueryRepository } from '../../comments/infrastructure/comments.query.repository';
import { exceptionImagesFactory } from '../../../infrastructure/exception-filters/exception-images.factory';
import { ImageValidator } from '../../../infrastructure/validators/image.validator';
import { BlogAddMainImageCommand } from '../application/usecases/blog-add-main-image.usecase';
import { BlogAddWallpaperImageCommand } from '../application/usecases/blog-add-wallpaper-image.usecase';
import { PostAddMainImageCommand } from '../application/usecases/post-add-main-image.usecase';

import { BlogQueryModel } from './models/input/blog.query.model';
import { BlogViewModel } from './models/output/blog-view.model';
import { BlogInputModel } from './models/input/blog-input-model';
import { BlogImagesViewModel } from './models/output/blog-images-view.model';
import { PostImagesViewModel } from './models/output/post-images-view.model';

@ApiTags('blogger/blogs')
@Controller('blogger/blogs')
export class BloggerBlogsController {
  constructor(
    private commandBus: CommandBus,
    private readonly blogsQueryRepository: BlogsQueryRepository,
    private readonly postsQueryRepository: PostsQueryRepository,
    private readonly commentsQueryRepository: CommentsQueryRepository,
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

  @Get('comments')
  @SwaggerOptions(
    'Returns all comments for all posts inside all current user blogs',
    true,
    false,
    200,
    'Success',
    BlogCommentSchema,
    false,
    false,
    true,
    false,
    false,
    false,
  )
  @UseGuards(JwtBearerGuard)
  async findCommentsForBlogger(
    @Query() query: BlogQueryModel,
    @UserIdFromGuard() userId: string,
  ) {
    if (isNaN(+userId)) {
      throw new UnauthorizedException();
    }

    return this.commentsQueryRepository.findCommentsForBlogger(query, +userId);
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

  @Post(':blogId/images/wallpaper')
  @SwaggerOptions(
    'Upload background wallpaper for Blog (.png or .jpg (.jpeg) file (max size is 100KB, width must be 1028, height must be 312px))',
    true,
    false,
    201,
    'Uploaded image information object',
    BlogImagesViewModel,
    'If file format is incorrect',
    ErrorsMessages,
    true,
    "If user try to update blog that doesn't belong to current user",
    false,
    false,
  )
  @UseInterceptors(FileInterceptor('file'))
  @UseGuards(JwtBearerGuard)
  async uploadBlogWallpaper(
    @UploadedFile(
      new ParseFilePipe({
        validators: [new ImageValidator(1028, 312, 100 * 1024)],
        exceptionFactory: exceptionImagesFactory,
      }),
    )
    file: Express.Multer.File,
    @Param('blogId') blogId: string,
    @UserIdFromGuard() userId: string,
  ) {
    if (isNaN(+blogId)) {
      throw new NotFoundException();
    }

    if (isNaN(+userId)) {
      throw new UnauthorizedException();
    }

    const result = await this.commandBus.execute(
      new BlogAddWallpaperImageCommand(
        blogId,
        userId,
        file.buffer,
        file.mimetype,
        file.originalname,
      ),
    );

    if (result.code !== ResultCode.Success) {
      return exceptionHandler(result.code, result.message, result.field);
    }

    return this.blogsQueryRepository.findBlogImages(+blogId);
  }

  @Post(':blogId/images/main')
  @SwaggerOptions(
    'Upload main square image for Blog (.png or .jpg (.jpeg) file (max size is 100KB, width must be 156, height must be 156))',
    true,
    false,
    201,
    'Uploaded image information object',
    BlogImagesViewModel,
    'If file format is incorrect',
    ErrorsMessages,
    true,
    "If user try to update blog that doesn't belong to current user",
    false,
    false,
  )
  @UseInterceptors(FileInterceptor('file'))
  @UseGuards(JwtBearerGuard)
  async uploadBlogMainImage(
    @UploadedFile(
      new ParseFilePipe({
        validators: [new ImageValidator(156, 156, 100 * 1024)],
        exceptionFactory: exceptionImagesFactory,
      }),
    )
    file: Express.Multer.File,
    @Param('blogId') blogId: string,
    @UserIdFromGuard() userId: string,
  ) {
    if (isNaN(+blogId)) {
      throw new NotFoundException();
    }

    if (isNaN(+userId)) {
      throw new UnauthorizedException();
    }

    const result = await this.commandBus.execute(
      new BlogAddMainImageCommand(
        blogId,
        userId,
        file.buffer,
        file.mimetype,
        file.originalname,
      ),
    );

    if (result.code !== ResultCode.Success) {
      return exceptionHandler(result.code, result.message, result.field);
    }

    return this.blogsQueryRepository.findBlogMainImages(+blogId);
  }

  @Post(':blogId/posts/:postId/images/main')
  @SwaggerOptions(
    'Upload main image for Post (.png or .jpg (.jpeg) file (max size is 100KB, width must be 940, height must be 432))',
    true,
    false,
    201,
    'Uploaded image information object',
    PostImagesViewModel,
    'If file format is incorrect',
    ErrorsMessages,
    true,
    "If user try to update blog that doesn't belong to current user",
    false,
    false,
  )
  @UseInterceptors(FileInterceptor('file'))
  @UseGuards(JwtBearerGuard)
  async uploadBlogMainImageForPost(
    @UploadedFile(
      new ParseFilePipe({
        validators: [new ImageValidator(940, 432, 100 * 1024)],
        exceptionFactory: exceptionImagesFactory,
      }),
    )
    file: Express.Multer.File,
    @Param('blogId') blogId: string,
    @Param('postId') postId: string,
    @UserIdFromGuard() userId: string,
  ) {
    if (isNaN(+blogId)) {
      throw new NotFoundException();
    }

    if (isNaN(+postId)) {
      throw new NotFoundException();
    }

    if (isNaN(+userId)) {
      throw new UnauthorizedException();
    }

    const result = await this.commandBus.execute(
      new PostAddMainImageCommand(
        blogId,
        postId,
        userId,
        file.buffer,
        file.mimetype,
        file.originalname,
      ),
    );

    if (result.code !== ResultCode.Success) {
      return exceptionHandler(result.code, result.message, result.field);
    }

    return this.postsQueryRepository.findPostMainImages(+postId);
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
