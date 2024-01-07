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
import { ApiBasicAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
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

import { CommentInputModel } from './models/input/comment-input.model';
import { CommentViewModel } from './models/output/comment-view.model';

@ApiTags('comments')
@Controller('comments')
export class CommentsController {
  constructor(
    private commandBus: CommandBus,
    private readonly commentsQueryRepository: CommentsQueryRepository,
  ) {}

  @Get(':id')
  @ApiOperation({
    summary: 'Returns comment by id',
  })
  async findCommentById(
    @Param('id') commentId: string,
  ): Promise<CommentViewModel | void> {
    if (isNaN(+commentId)) {
      throw new NotFoundException();
    }

    const result = await this.commentsQueryRepository.findComment(+commentId);

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
  @ApiOperation({
    summary: 'Update existing comment by id with InputModel',
  })
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

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete comment specified by id',
  })
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
