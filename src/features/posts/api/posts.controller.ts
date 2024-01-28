import {
  Body,
  Controller,
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
import { ApiBasicAuth, ApiTags } from '@nestjs/swagger';

import { PostsQueryRepository } from '../infrastructure/posts.query.repository';
import { exceptionHandler } from '../../../infrastructure/exception-filters/exception.handler';
import { ResultCode } from '../../../base/enums/result-code.enum';
import { postIDField, postNotFound } from '../../../base/constants/constants';
import { PostCreateCommentCommand } from '../application/usecases/create-comment-for-post.usecase';
import { CommentInputModel } from '../../comments/api/models/input/comment-input.model';
import { JwtBearerGuard } from '../../auth/guards/jwt-bearer.guard';
import { UserIdFromGuard } from '../../auth/decorators/user-id-from-guard.guard.decorator';
import { CommentsQueryRepository } from '../../comments/infrastructure/comments.query.repository';
import { CommentQueryModel } from '../../comments/api/models/input/comment.query.model';
import { PostLikeOperationCommand } from '../application/usecases/post-like-operation.usecase';
import { UserIdFromHeaders } from '../../auth/decorators/user-id-from-headers.decorator';
import { UsersQueryRepository } from '../../users/infrastructure/users.query.repository';
import { SwaggerOptions } from '../../../infrastructure/decorators/swagger';
import { ErrorsMessages } from '../../../base/schemas/api-errors-messages.schema';

import { PostQueryModel } from './models/input/post.query.model';
import { LikeStatusInputModel } from './models/input/like-status-input.model';
import { PostViewModel } from './models/output/post-view.model';

@ApiTags('posts')
@Controller('posts')
export class PostsController {
  constructor(
    private commandBus: CommandBus,
    private readonly postsQueryRepository: PostsQueryRepository,
    private readonly commentsQueryRepository: CommentsQueryRepository,
    private readonly usersQueryRepository: UsersQueryRepository,
  ) {}
  @Get()
  @SwaggerOptions(
    'Returns all posts',
    false,
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
  async findPosts(
    @Query() query: PostQueryModel,
    @UserIdFromHeaders('id') userId: string,
  ) {
    const user = await this.usersQueryRepository.findUserByIdBool(+userId);

    let checkedUserId = null;
    if (user) {
      checkedUserId = +userId;
    }

    return await this.postsQueryRepository.findPosts(query, checkedUserId);
  }

  @Get(':id')
  @SwaggerOptions(
    'Return post by id',
    false,
    false,
    200,
    'Success',
    PostViewModel,
    false,
    false,
    false,
    false,
    true,
    false,
  )
  async findPostById(
    @Param('id') postId: string,
    @UserIdFromHeaders('id') userId: string,
  ) {
    if (isNaN(+postId)) {
      throw new NotFoundException();
    }

    const user = await this.usersQueryRepository.findUserByIdBool(+userId);

    let checkedUserId = null;
    if (user) {
      checkedUserId = +userId;
    }

    const result = await this.postsQueryRepository.findPostByPostId(
      +postId,
      checkedUserId,
    );

    if (!result) {
      return exceptionHandler(ResultCode.NotFound, postNotFound, postIDField);
    }

    return result;
  }

  @Get(':id/comments')
  @SwaggerOptions(
    'Returns comments for specified post',
    false,
    false,
    200,
    'Success',
    PostViewModel,
    false,
    false,
    false,
    false,
    "If post for passed postId doesn't exist",
    false,
  )
  async findCommentsByPostId(
    @Param('id') postId: string,
    @UserIdFromHeaders('id') userId: string,
    @Query() query: CommentQueryModel,
  ) {
    if (isNaN(+postId)) {
      throw new NotFoundException();
    }

    const post = await this.postsQueryRepository.checkExistenceOfPost(+postId);

    if (!post) {
      return exceptionHandler(ResultCode.NotFound, postNotFound, postIDField);
    }

    const user = await this.usersQueryRepository.findUserByIdBool(+userId);

    let checkedUserId = null;
    if (user) {
      checkedUserId = +userId;
    }

    return await this.commentsQueryRepository.findCommentsByPostId(
      query,
      +postId,
      checkedUserId,
    );
  }

  @Post(':id/comments')
  @SwaggerOptions(
    'Create new comment',
    true,
    false,
    201,
    'Returns the newly created post',
    PostViewModel,
    true,
    ErrorsMessages,
    true,
    false,
    'If post with specified postId does not exists',
    false,
  )
  @UseGuards(JwtBearerGuard)
  @HttpCode(201)
  async createComment(
    @Param('id') postId: string,
    @Body() commentInputModel: CommentInputModel,
    @UserIdFromGuard() userId: string,
  ) {
    const result = await this.commandBus.execute(
      new PostCreateCommentCommand(commentInputModel, postId, userId),
    );

    if (result.code !== ResultCode.Success) {
      return exceptionHandler(result.code, result.message, result.field);
    }

    return this.commentsQueryRepository.findNewlyCreatedComment(
      result.response,
    );
  }

  @Put(':id/like-status')
  @SwaggerOptions(
    'Make like/unlike/dislike/undislike operation',
    true,
    false,
    204,
    'No Content',
    LikeStatusInputModel,
    false,
    ErrorsMessages,
    true,
    false,
    "If post with specified postId doesn't exists",
    false,
  )
  @ApiBasicAuth('Bearer')
  @UseGuards(JwtBearerGuard)
  @HttpCode(204)
  async postLikeStatus(
    @Param('id') postId: string,
    @UserIdFromGuard() userId: string,
    @Body() likeStatusInputModel: LikeStatusInputModel,
  ) {
    const result = await this.commandBus.execute(
      new PostLikeOperationCommand(postId, userId, likeStatusInputModel),
    );

    if (result.code !== ResultCode.Success) {
      return exceptionHandler(result.code, result.message, result.field);
    }

    return result;
  }
}
