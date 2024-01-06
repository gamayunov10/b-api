import {
  Body,
  Controller,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
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

import { PostQueryModel } from './models/input/post.query.model';

@ApiTags('posts')
@Controller('posts')
export class PostsController {
  constructor(
    private commandBus: CommandBus,
    private readonly postsQueryRepository: PostsQueryRepository,
    private readonly commentsQueryRepository: CommentsQueryRepository,
  ) {}
  @Get('')
  @ApiOperation({
    summary: 'Returns all posts',
  })
  async findPosts(@Query() query: PostQueryModel) {
    return await this.postsQueryRepository.findPosts(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Return post by id',
  })
  async findPostById(@Param('id') postId: string) {
    if (isNaN(+postId)) {
      throw new NotFoundException();
    }

    const result = await this.postsQueryRepository.findPostByPostId(+postId);

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
    @Query() query: CommentQueryModel,
  ) {
    if (isNaN(+postId)) {
      throw new NotFoundException();
    }

    const post = await this.postsQueryRepository.findPostByPostId(+postId);

    if (!post) {
      return exceptionHandler(ResultCode.NotFound, postNotFound, postIDField);
    }

    return await this.commentsQueryRepository.findCommentsByPostId(
      +postId,
      query,
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

    return this.commentsQueryRepository.findComment(result.response);
  }
}
