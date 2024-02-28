import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';

import { BanBlogInputModel } from '../../api/models/input/ban-blog-input.model';
import { BlogsRepository } from '../../infrastructure/blogs.repository';
import { BlogsQueryRepository } from '../../infrastructure/blogs.query.repository';
import { ExceptionResultType } from '../../../../infrastructure/types/exceptions.types';
import { ResultCode } from '../../../../base/enums/result-code.enum';
import {
  blogIdField,
  blogNotFound,
} from '../../../../base/constants/constants';

export class SABlogBanCommand {
  constructor(
    public banBlogInputModel: BanBlogInputModel,
    public blogId: string,
  ) {}
}

@CommandHandler(SABlogBanCommand)
export class BlogBanUseCase implements ICommandHandler<SABlogBanCommand> {
  constructor(
    private readonly blogsRepository: BlogsRepository,
    private readonly blogsQueryRepository: BlogsQueryRepository,
  ) {}

  async execute(
    command: SABlogBanCommand,
  ): Promise<ExceptionResultType<boolean>> {
    if (isNaN(+command.blogId)) {
      throw new NotFoundException();
    }

    const blog = await this.blogsQueryRepository.findBlogEntity(
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

    if (command.banBlogInputModel.isBanned) {
      const result = await this.blogsRepository.banBlog(blog);

      if (!result) {
        return {
          data: false,
          code: ResultCode.NotFound,
          field: blogIdField,
          message: blogNotFound,
        };
      }
    } else {
      const result = await this.blogsRepository.unBanBlog(blog);

      if (!result) {
        return {
          data: false,
          code: ResultCode.NotFound,
          field: blogIdField,
          message: blogNotFound,
        };
      }
    }

    return {
      data: true,
      code: ResultCode.Success,
    };
  }
}
