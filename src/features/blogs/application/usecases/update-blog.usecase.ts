import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';

import { BlogsRepository } from '../../infrastructure/blogs.repository';
import { BlogInputModel } from '../../api/models/input/blog-input-model';
import { BlogsQueryRepository } from '../../infrastructure/blogs.query.repository';
import { ResultCode } from '../../../../base/enums/result-code.enum';
import {
  blogIdField,
  blogNotFound,
  userIdField,
  userNotFound,
} from '../../../../base/constants/constants';
import { ExceptionResultType } from '../../../../infrastructure/types/exceptions.types';
import { UsersQueryRepository } from '../../../users/infrastructure/users.query.repository';

export class BlogUpdateCommand {
  constructor(
    public blogInputModel: BlogInputModel,
    public blogId: string,
    public userId: string,
  ) {}
}

@CommandHandler(BlogUpdateCommand)
export class BlogUpdateUseCase implements ICommandHandler<BlogUpdateCommand> {
  constructor(
    private readonly blogsRepository: BlogsRepository,
    private readonly blogsQueryRepository: BlogsQueryRepository,
    private readonly usersQueryRepository: UsersQueryRepository,
  ) {}

  async execute(
    command: BlogUpdateCommand,
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
        code: ResultCode.NotFound,
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

    if (blog.userId !== +command.userId) {
      return {
        data: false,
        code: ResultCode.Forbidden,
      };
    }

    await this.blogsRepository.updateBlog(
      command.blogInputModel,
      +command.blogId,
    );

    return {
      data: true,
      code: ResultCode.Success,
    };
  }
}
