import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';

import { ExceptionResultType } from '../../../../infrastructure/types/exceptions.types';
import { ResultCode } from '../../../../base/enums/result-code.enum';
import {
  blogIdField,
  blogIsAlreadyBounded,
  blogNotFound,
  userIdField,
  userNotFound,
} from '../../../../base/constants/constants';
import { UsersQueryRepository } from '../../../users/infrastructure/users.query.repository';
import { BlogsQueryRepository } from '../../infrastructure/blogs.query.repository';
import { BlogsRepository } from '../../infrastructure/blogs.repository';
import { BlogOwnerStatus } from '../../../../base/enums/blog-owner.enum';

export class BlogBindWithUserCommand {
  constructor(public blogId: string, public userId: string) {}
}

@CommandHandler(BlogBindWithUserCommand)
export class BlogBindWithUserUseCase
  implements ICommandHandler<BlogBindWithUserCommand>
{
  constructor(
    private readonly blogsRepository: BlogsRepository,
    private readonly blogsQueryRepository: BlogsQueryRepository,
    private readonly usersQueryRepository: UsersQueryRepository,
  ) {}

  async execute(
    command: BlogBindWithUserCommand,
  ): Promise<ExceptionResultType<boolean>> {
    if (isNaN(+command.blogId) || isNaN(+command.userId)) {
      throw new NotFoundException();
    }

    const blog = await this.blogsQueryRepository.findBlogWithOwner(
      +command.blogId,
    );

    if (!blog) {
      return {
        data: false,
        code: ResultCode.BadRequest,
        field: blogIdField,
        message: blogNotFound,
      };
    }

    const user = await this.usersQueryRepository.findUserById(+command.userId);

    if (!user) {
      return {
        data: false,
        code: ResultCode.BadRequest,
        field: userIdField,
        message: userNotFound,
      };
    }

    if (blog.userId !== BlogOwnerStatus.NOT_BOUND) {
      return {
        data: false,
        code: ResultCode.BadRequest,
        field: blogIdField,
        message: blogIsAlreadyBounded,
      };
    }

    await this.blogsRepository.bindBlogWithUser(
      +command.blogId,
      +command.userId,
    );

    return {
      data: true,
      code: ResultCode.Success,
    };
  }
}
