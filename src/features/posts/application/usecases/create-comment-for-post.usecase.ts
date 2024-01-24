import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

import { PostsRepository } from '../../infrastructure/posts.repository';
import { ResultCode } from '../../../../base/enums/result-code.enum';
import { ExceptionResultType } from '../../../../infrastructure/types/exceptions.types';
import {
  postIDField,
  postNotFound,
} from '../../../../base/constants/constants';
import { PostsQueryRepository } from '../../infrastructure/posts.query.repository';
import { CommentInputModel } from '../../../comments/api/models/input/comment-input.model';

export class PostCreateCommentCommand {
  constructor(
    public commentInputModel: CommentInputModel,
    public postId: string,
    public userId: string,
  ) {}
}

@CommandHandler(PostCreateCommentCommand)
export class PostCreateCommentUseCase
  implements ICommandHandler<PostCreateCommentCommand>
{
  constructor(
    private readonly postsRepository: PostsRepository,
    private readonly postsQueryRepository: PostsQueryRepository,
  ) {}

  async execute(
    command: PostCreateCommentCommand,
  ): Promise<ExceptionResultType<boolean>> {
    if (isNaN(+command.postId)) {
      throw new NotFoundException();
    }

    if (isNaN(+command.userId)) {
      throw new ForbiddenException();
    }

    const post = await this.postsQueryRepository.checkExistenceOfPost(
      +command.postId,
    );

    if (!post) {
      return {
        data: false,
        code: ResultCode.NotFound,
        field: postIDField,
        message: postNotFound,
      };
    }

    const postId = await this.postsRepository.createCommentForSpecificPost(
      +command.postId,
      +command.userId,
      command.commentInputModel,
    );

    return {
      data: true,
      code: ResultCode.Success,
      response: postId,
    };
  }
}
