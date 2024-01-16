import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiBasicAuth, ApiTags } from '@nestjs/swagger';
import { CommandBus } from '@nestjs/cqrs';

import { exceptionHandler } from '../../../infrastructure/exception-filters/exception.handler';
import { ResultCode } from '../../../base/enums/result-code.enum';
import {
  commentIDField,
  commentNotFound,
} from '../../../base/constants/constants';
import { CommentsQueryRepository } from '../infrastructure/comments.query.repository';
import { JwtBearerGuard } from '../../auth/guards/jwt-bearer.guard';
import { UserIdFromGuard } from '../../auth/decorators/user-id-from-guard.guard.decorator';
import { CommentUpdateCommand } from '../application/usecases/update-comment.usecase';
import { CommentDeleteCommand } from '../application/usecases/delete-comment.usecase';
import { LikeStatusInputModel } from '../../posts/api/models/input/like-status-input.model';
import { CommentLikeOperationCommand } from '../application/usecases/comment-like-operation.usecase';
import { UserIdFromHeaders } from '../../auth/decorators/user-id-from-headers.decorator';
import { UsersQueryRepository } from '../../users/infrastructure/users.query.repository';
import { SwaggerOptions } from '../../../infrastructure/decorators/swagger';
import { ErrorsMessages } from '../../../base/schemas/api-errors-messages.schema';

import { CommentViewModel } from './models/output/comment-view.model';
import { CommentInputModel } from './models/input/comment-input.model';

@ApiTags('comments')
@Controller('comments')
export class CommentsController {
  constructor(
    private commandBus: CommandBus,
    private readonly commentsQueryRepository: CommentsQueryRepository,
    private readonly usersQueryRepository: UsersQueryRepository,
  ) {}

  @Get(':id')
  @SwaggerOptions(
    'Returns comment by id',
    false,
    false,
    200,
    'Success',
    CommentViewModel,
    false,
    false,
    false,
    false,
    true,
    false,
  )
  async findCommentById(
    @Param('id') commentId: string,
    @UserIdFromHeaders('id') userId: string,
  ): Promise<CommentViewModel | void> {
    if (isNaN(+commentId)) {
      throw new NotFoundException();
    }

    const user = await this.usersQueryRepository.findUserByIdBool(+userId);

    let userIdNumber = null;
    if (user) {
      userIdNumber = +userId;
    }

    const result = await this.commentsQueryRepository.findComment(
      +commentId,
      userIdNumber,
    );

    if (!result) {
      return exceptionHandler(
        ResultCode.NotFound,
        commentNotFound,
        commentIDField,
      );
    }

    return result;
  }

  @Put(':id')
  @SwaggerOptions(
    'Update existing comment by id with InputModel',
    true,
    false,
    204,
    'No Content',
    false,
    true,
    ErrorsMessages,
    true,
    'If try edit the comment that is not your own',
    true,
    false,
  )
  @ApiBasicAuth('Bearer')
  @UseGuards(JwtBearerGuard)
  @HttpCode(204)
  async updateComment(
    @Param('id') commentId: string,
    @UserIdFromGuard() userId: string,
    @Body() commentInputModel: CommentInputModel,
  ): Promise<void> {
    const result = await this.commandBus.execute(
      new CommentUpdateCommand(commentId, userId, commentInputModel),
    );

    if (result.code !== ResultCode.Success) {
      return exceptionHandler(result.code, result.message, result.field);
    }

    return result;
  }

  @Put(':id/like-status')
  @SwaggerOptions(
    'Make like/unlike/dislike/undislike operation',
    true,
    false,
    204,
    'No Content',
    false,
    true,
    ErrorsMessages,
    true,
    false,
    "If comment with specified id doesn't exists",
    false,
  )
  @ApiBasicAuth('Bearer')
  @UseGuards(JwtBearerGuard)
  @HttpCode(204)
  async commentLikeStatus(
    @Param('id') commentId: string,
    @UserIdFromGuard() userId: string,
    @Body() likeStatusInputModel: LikeStatusInputModel,
  ) {
    const result = await this.commandBus.execute(
      new CommentLikeOperationCommand(commentId, userId, likeStatusInputModel),
    );

    if (result.code !== ResultCode.Success) {
      return exceptionHandler(result.code, result.message, result.field);
    }

    return result;
  }

  @Delete(':id')
  @SwaggerOptions(
    'Delete comment specified by id',
    true,
    false,
    204,
    'No Content',
    false,
    true,
    false,
    true,
    true,
    true,
    false,
  )
  @ApiBasicAuth('Bearer')
  @UseGuards(JwtBearerGuard)
  @HttpCode(204)
  async deleteComment(
    @Param('id') commentId: string,
    @UserIdFromGuard('id') userId: string,
  ): Promise<void> {
    const result = await this.commandBus.execute(
      new CommentDeleteCommand(commentId, userId),
    );

    if (result.code !== ResultCode.Success) {
      return exceptionHandler(result.code, result.message, result.field);
    }

    return result;
  }
}
