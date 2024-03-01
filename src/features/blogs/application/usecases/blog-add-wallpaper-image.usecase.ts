import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import sharp from 'sharp';

import { S3Adapter } from '../../../../base/application/adapters/s3.adapter';
import { ExceptionResultType } from '../../../../infrastructure/types/exceptions.types';
import { BlogsQueryRepository } from '../../infrastructure/blogs.query.repository';
import { ResultCode } from '../../../../base/enums/result-code.enum';
import {
  blogIdField,
  blogNotFound,
} from '../../../../base/constants/constants';
import { BlogsRepository } from '../../infrastructure/blogs.repository';
import { Blog } from '../../domain/blog.entity';

export class BlogAddWallpaperImageCommand {
  constructor(
    public blogId: string,
    public userId: string,
    public buffer: Buffer,
    public mimetype: string,
    public originalName: string,
  ) {}
}

@CommandHandler(BlogAddWallpaperImageCommand)
export class BlogAddWallpaperImageUseCase
  implements ICommandHandler<BlogAddWallpaperImageCommand>
{
  constructor(
    private readonly blogsRepository: BlogsRepository,
    private readonly blogsQueryRepository: BlogsQueryRepository,
    private readonly s3Adapter: S3Adapter,
  ) {}

  async execute(
    command: BlogAddWallpaperImageCommand,
  ): Promise<ExceptionResultType<boolean>> {
    const blog: Blog = await this.blogsQueryRepository.findBlogEntity(
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

    const s3Key = `blogger/images/wallpapers/${command.blogId}_${command.originalName}`;

    await this.s3Adapter.uploadImage(s3Key, command.buffer, command.mimetype);

    const image = sharp(command.buffer);
    const metadata = await image.metadata();

    const wallpaperImage =
      await this.blogsQueryRepository.findBlogWallpaperImageRecord(
        +command.blogId,
      );

    if (!wallpaperImage) {
      const result = await this.blogsRepository.uploadBlogWallpaperImage(
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
    } else {
      const result = await this.blogsRepository.updateBlogWallpaperImage(
        metadata,
        s3Key,
        blog.id,
      );

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
