import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UnauthorizedException } from '@nestjs/common';

import { UsersRepository } from '../../infrastructure/users.repository';
import { UsersQueryRepository } from '../../infrastructure/users.query.repository';
import { UserBanByBloggerInputModel } from '../../api/models/input/user-ban-by-blogger.input.model';
import { BlogsQueryRepository } from '../../../blogs/infrastructure/blogs.query.repository';
import { ResultCode } from '../../../../base/enums/result-code.enum';
import { ExceptionResultType } from '../../../../infrastructure/types/exceptions.types';
import {
  userIdField,
  userNotFound,
} from '../../../../base/constants/constants';

export class UserBanByBloggerCommand {
  constructor(
    public userBanByBloggerInputModel: UserBanByBloggerInputModel,
    public userId: string,
    public bloggerId: string,
  ) {}
}

@CommandHandler(UserBanByBloggerCommand)
export class UserBanByBloggerUseCase
  implements ICommandHandler<UserBanByBloggerCommand>
{
  constructor(
    protected readonly usersRepository: UsersRepository,
    protected readonly usersQueryRepository: UsersQueryRepository,
    protected readonly blogsQueryRepository: BlogsQueryRepository,
  ) {}

  async execute(
    command: UserBanByBloggerCommand,
  ): Promise<ExceptionResultType<boolean>> {
    if (
      isNaN(+command.userId) ||
      isNaN(+command.bloggerId) ||
      isNaN(+command.userBanByBloggerInputModel.blogId)
    ) {
      throw new UnauthorizedException();
    }

    const user =
      await this.usersQueryRepository.findUserEntityByIdWithoutManager(
        +command.userId,
      );

    if (!user) {
      return {
        data: false,
        code: ResultCode.NotFound,
        field: userIdField,
        message: userNotFound,
      };
    }

    const blog = await this.blogsQueryRepository.findBlogEntity(
      +command.userBanByBloggerInputModel.blogId,
    );

    if (blog?.user.id !== +command.bloggerId) {
      return {
        data: false,
        code: ResultCode.Forbidden,
      };
    }

    if (command.userBanByBloggerInputModel.isBanned) {
      const result = await this.usersRepository.banUserByBlogger(
        +command.userId,
        +command.userBanByBloggerInputModel.blogId,
        command.userBanByBloggerInputModel,
        blog,
        user,
      );

      if (!result) {
        return {
          data: false,
          code: ResultCode.NotFound,
          field: userIdField,
          message: userNotFound,
        };
      }
    } else {
      const result = await this.usersRepository.unBanUserByBlogger(
        +command.userId,
        +command.userBanByBloggerInputModel.blogId,
      );

      if (!result) {
        return {
          data: false,
          code: ResultCode.NotFound,
          field: userIdField,
          message: userNotFound,
        };
      }
    }

    return {
      data: true,
      code: ResultCode.Success,
    };
  }
}
