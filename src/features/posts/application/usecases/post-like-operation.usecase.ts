import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';

import { PostsRepository } from '../../infrastructure/posts.repository';
import { ExceptionResultType } from '../../../../infrastructure/types/exceptions.types';
import { ResultCode } from '../../../../base/enums/result-code.enum';
import {
  postIDField,
  postNotFound,
} from '../../../../base/constants/constants';
import { PostsQueryRepository } from '../../infrastructure/posts.query.repository';
import { LikeStatusInputModel } from '../../api/models/input/like-status-input.model';
import { UsersQueryRepository } from '../../../users/infrastructure/users.query.repository';

export class PostLikeOperationCommand {
  constructor(
    public postId: string,
    public userId: string,
    public likeStatusInputModel: LikeStatusInputModel,
  ) {}
}

@CommandHandler(PostLikeOperationCommand)
export class PostLikeOperationUseCase
  implements ICommandHandler<PostLikeOperationCommand>
{
  constructor(
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly postsRepository: PostsRepository,
    private readonly postsQueryRepository: PostsQueryRepository,
  ) {}

  async execute(
    command: PostLikeOperationCommand,
  ): Promise<ExceptionResultType<boolean>> {
    if (isNaN(+command.postId) || isNaN(+command.userId)) {
      throw new NotFoundException();
    }

    const user = await this.usersQueryRepository.findUserById(+command.userId);

    if (!user) {
      throw new UnauthorizedException();
    }

    const post = await this.postsQueryRepository.findPostByPostId(
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

    await this.postsRepository.postLikeStatus(
      +command.postId,
      +command.userId,
      command.likeStatusInputModel,
    );

    return {
      data: true,
      code: ResultCode.Success,
    };
  }
}
