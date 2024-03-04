import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import sharp from 'sharp';

import { ExceptionResultType } from '../../../../infrastructure/types/exceptions.types';
import { ResultCode } from '../../../../base/enums/result-code.enum';
import {
  blogIdField,
  blogNotFound,
} from '../../../../base/constants/constants';
import { BlogsQueryRepository } from '../../infrastructure/blogs.query.repository';
import { S3Adapter } from '../../../../base/application/adapters/s3.adapter';
import { BlogsRepository } from '../../infrastructure/blogs.repository';

export class BlogAddMainImageCommand {
  constructor(
    public blogId: string,
    public userId: string,
    public buffer: Buffer,
    public mimetype: string,
    public originalName: string,
  ) {}
}

@CommandHandler(BlogAddMainImageCommand)
export class BlogAddMainImageUseCase
  implements ICommandHandler<BlogAddMainImageCommand>
{
  constructor(
    private readonly blogsQueryRepository: BlogsQueryRepository,
    private readonly blogsRepository: BlogsRepository,
    private readonly s3Adapter: S3Adapter,
  ) {}

  async execute(
    command: BlogAddMainImageCommand,
  ): Promise<ExceptionResultType<boolean>> {
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

    if (blog.user.id !== +command.userId) {
      return {
        data: false,
        code: ResultCode.Forbidden,
      };
    }

    const s3Key = `blogger/images/main/${command.blogId}_${command.originalName}`;

    const uploadResult = await this.s3Adapter.uploadImage(
      s3Key,
      command.buffer,
      command.mimetype,
    );

    if (!uploadResult) {
      return {
        data: false,
        code: ResultCode.BadRequest,
        field: 'Image',
        message: 'Incorrect Format',
      };
    }

    const image = sharp(command.buffer);
    const metadata = await image.metadata();

    const result = await this.blogsRepository.uploadBlogMainImage(
      metadata,
      s3Key,
      blog,
    );

    if (!result) {
      return {
        data: false,
        code: ResultCode.NotFound,
        field: blogIdField,
        message: blogNotFound,
      };
    }

    return {
      data: true,
      code: ResultCode.Success,
    };
  }
}
