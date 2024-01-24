import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

import { ResultCode } from '../../../../base/enums/result-code.enum';
import { ExceptionResultType } from '../../../../infrastructure/types/exceptions.types';
import {
  commentIDField,
  commentNotFound,
} from '../../../../base/constants/constants';
import { CommentsQueryRepository } from '../../infrastructure/comments.query.repository';
import { CommentInputModel } from '../../api/models/input/comment-input.model';
import { CommentsRepository } from '../../infrastructure/comments.repository';

export class CommentUpdateCommand {
  constructor(
    public commentId: string,
    public userId: string,
    public commentInputModel: CommentInputModel,
  ) {}
}

@CommandHandler(CommentUpdateCommand)
export class CommentUpdateUseCase
  implements ICommandHandler<CommentUpdateCommand>
{
  constructor(
    private readonly commentsRepository: CommentsRepository,
    private readonly commentsQueryRepository: CommentsQueryRepository,
  ) {}

  async execute(
    command: CommentUpdateCommand,
  ): Promise<ExceptionResultType<boolean>> {
    if (isNaN(+command.commentId)) {
      throw new NotFoundException();
    }

    const comment = await this.commentsQueryRepository.checkExistenceOfComment(
      +command.commentId,
    );

    if (!comment) {
      return {
        data: false,
        code: ResultCode.NotFound,
        field: commentIDField,
        message: commentNotFound,
      };
    }

    if (+command.userId !== +comment.userId) {
      throw new ForbiddenException();
    }

    await this.commentsRepository.updateComment(
      +command.commentId,
      command.commentInputModel,
    );

    return {
      data: true,
      code: ResultCode.Success,
    };
  }
}
