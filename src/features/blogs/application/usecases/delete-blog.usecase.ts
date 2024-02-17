import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';

import { BlogsRepository } from '../../infrastructure/blogs.repository';
import { BlogsQueryRepository } from '../../infrastructure/blogs.query.repository';
import { Role } from '../../../../base/enums/roles.enum';
import { ResultCode } from '../../../../base/enums/result-code.enum';
import {
  blogIdField,
  blogNotFound,
  userIdField,
  userNotFound,
} from '../../../../base/constants/constants';
import { UsersQueryRepository } from '../../../users/infrastructure/users.query.repository';
import { ExceptionResultType } from '../../../../infrastructure/types/exceptions.types';

export class BlogDeleteCommand {
  constructor(
    public blogId: string,
    public userId?: string,
    public role?: Role,
  ) {}
}

@CommandHandler(BlogDeleteCommand)
export class BlogDeleteUseCase implements ICommandHandler<BlogDeleteCommand> {
  constructor(
    private readonly blogsRepository: BlogsRepository,
    private readonly blogsQueryRepository: BlogsQueryRepository,
    private readonly usersQueryRepository: UsersQueryRepository,
  ) {}

  async execute(
    command: BlogDeleteCommand,
  ): Promise<ExceptionResultType<boolean>> {
    if (isNaN(+command.blogId)) {
      throw new NotFoundException();
    }

    const blog = await this.blogsQueryRepository.findBlogWithOwner(
      +command.blogId,
    );

    if (!blog) {
      return {
        data: false,
        code: ResultCode.NotFound,
        field: blogIdField,
        message: blogNotFound,
      };
    }

    if (command.role === Role.BLOGGER) {
      if (isNaN(+command.userId)) {
        throw new NotFoundException();
      }

      const user = await this.usersQueryRepository.findUserById(
        +command.userId,
      );

      if (!user) {
        return {
          data: false,
          code: ResultCode.BadRequest,
          field: userIdField,
          message: userNotFound,
        };
      }

      if (blog.userId !== +command.userId) {
        return {
          data: false,
          code: ResultCode.Forbidden,
        };
      }
    }

    await this.blogsRepository.deleteBlog(+command.blogId);

    return {
      data: true,
      code: ResultCode.Success,
    };
  }
}
