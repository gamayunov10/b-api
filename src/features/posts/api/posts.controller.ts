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
import { ApiBasicAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

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

import { PostQueryModel } from './models/input/post.query.model';
import { LikeStatusInputModel } from './models/input/like-status-input.model';

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
  @ApiOperation({
    summary: 'Returns all posts',
  })
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
  @ApiOperation({
    summary: 'Return post by id',
  })
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
  @ApiOperation({
    summary: 'Returns comments for specified post',
  })
  async findCommentsByPostId(
    @Param('id') postId: string,
    @UserIdFromHeaders('id') userId: string,
    @Query() query: CommentQueryModel,
  ) {
    if (isNaN(+postId)) {
      throw new NotFoundException();
    }

    const post = await this.postsQueryRepository.findPostByPostId(+postId);

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
  @ApiOperation({
    summary: 'Create new comment',
  })
  @ApiBasicAuth('Bearer')
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

    return this.commentsQueryRepository.findComment(result.response, +userId);
  }

  @Put(':id/like-status')
  @ApiOperation({
    summary: 'Make like/unlike/dislike/undislike operation',
  })
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
