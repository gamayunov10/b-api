import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';

import { LikeStatusInputModel } from '../../../posts/api/models/input/like-status-input.model';
import { UsersQueryRepository } from '../../../users/infrastructure/users.query.repository';
import { ExceptionResultType } from '../../../../infrastructure/types/exceptions.types';
import { CommentsRepository } from '../../infrastructure/comments.repository';
import { CommentsQueryRepository } from '../../infrastructure/comments.query.repository';
import { ResultCode } from '../../../../base/enums/result-code.enum';
import {
  commentIDField,
  commentNotFound,
} from '../../../../base/constants/constants';

export class CommentLikeOperationCommand {
  constructor(
    public commentId: string,
    public userId: string,
    public likeStatusInputModel: LikeStatusInputModel,
  ) {}
}

@CommandHandler(CommentLikeOperationCommand)
export class CommentLikeOperationUseCase
  implements ICommandHandler<CommentLikeOperationCommand>
{
  constructor(
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly commentsRepository: CommentsRepository,
    private readonly commentsQueryRepository: CommentsQueryRepository,
  ) {}

  async execute(
    command: CommentLikeOperationCommand,
  ): Promise<ExceptionResultType<boolean>> {
    if (isNaN(+command.commentId) || isNaN(+command.userId)) {
      throw new NotFoundException();
    }

    const user = await this.usersQueryRepository.findUserById(+command.userId);

    if (!user) {
      throw new UnauthorizedException();
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

    await this.commentsRepository.commentLikeStatus(
      +command.commentId,
      +command.userId,
      command.likeStatusInputModel,
    );

    return {
      data: true,
      code: ResultCode.Success,
    };
  }
}
