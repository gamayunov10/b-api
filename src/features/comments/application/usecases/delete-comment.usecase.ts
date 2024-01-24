import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

import { CommentsRepository } from '../../infrastructure/comments.repository';
import { CommentsQueryRepository } from '../../infrastructure/comments.query.repository';
import { ResultCode } from '../../../../base/enums/result-code.enum';
import {
  commentIDField,
  commentNotFound,
} from '../../../../base/constants/constants';
import { ExceptionResultType } from '../../../../infrastructure/types/exceptions.types';

export class CommentDeleteCommand {
  constructor(public commentId: string, public userId: string) {}
}

@CommandHandler(CommentDeleteCommand)
export class CommentDeleteUseCase
  implements ICommandHandler<CommentDeleteCommand>
{
  constructor(
    private readonly commentsRepository: CommentsRepository,
    private readonly commentsQueryRepository: CommentsQueryRepository,
  ) {}

  async execute(
    command: CommentDeleteCommand,
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

    await this.commentsRepository.deleteComment(+command.commentId);

    return {
      data: true,
      code: ResultCode.Success,
    };
  }
}
