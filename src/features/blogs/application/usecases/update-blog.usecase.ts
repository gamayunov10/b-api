import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

import { BlogsRepository } from '../../infrastructure/blogs.repository';
import { BlogInputModel } from '../../api/models/input/blog-input-model';
import { BlogsQueryRepository } from '../../infrastructure/blogs.query.repository';
import { ResultCode } from '../../../../base/enums/result-code.enum';
import {
  blogIdField,
  blogNotFound,
} from '../../../../base/constants/constants';
import { ExceptionResultType } from '../../../../infrastructure/types/exceptions.types';
import { Role } from '../../../../base/enums/roles.enum';

export class BlogUpdateCommand {
  constructor(
    public blogInputModel: BlogInputModel,
    public blogId: string,
    public blogOwner: Role | number,
  ) {}
}

@CommandHandler(BlogUpdateCommand)
export class BlogUpdateUseCase implements ICommandHandler<BlogUpdateCommand> {
  constructor(
    private readonly blogsRepository: BlogsRepository,
    private readonly blogsQueryRepository: BlogsQueryRepository,
  ) {}

  async execute(
    command: BlogUpdateCommand,
  ): Promise<ExceptionResultType<boolean>> {
    if (isNaN(+command.blogId)) {
      throw new NotFoundException();
    }

    const blog = await this.blogsQueryRepository.findBlogById(+command.blogId);

    if (!blog) {
      return {
        data: false,
        code: ResultCode.NotFound,
        field: blogIdField,
        message: blogNotFound,
      };
    }

    if (
      typeof command.blogOwner === 'number' &&
      command.blogOwner !== +blog.id
    ) {
      throw new ForbiddenException();
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
