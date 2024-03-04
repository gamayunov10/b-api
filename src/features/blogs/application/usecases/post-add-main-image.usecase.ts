import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import sharp from 'sharp';

import { S3Adapter } from '../../../../base/application/adapters/s3.adapter';
import { ExceptionResultType } from '../../../../infrastructure/types/exceptions.types';
import { ResultCode } from '../../../../base/enums/result-code.enum';
import {
  blogIdField,
  blogNotFound,
  postIDField,
  postNotFound,
} from '../../../../base/constants/constants';
import { BlogsQueryRepository } from '../../infrastructure/blogs.query.repository';
import { PostsQueryRepository } from '../../../posts/infrastructure/posts.query.repository';
import { PostsRepository } from '../../../posts/infrastructure/posts.repository';

export class PostAddMainImageCommand {
  constructor(
    public blogId: string,
    public postId: string,
    public userId: string,
    public buffer: Buffer,
    public mimetype: string,
    public originalName: string,
  ) {}
}

@CommandHandler(PostAddMainImageCommand)
export class PostAddMainImageUseCase
  implements ICommandHandler<PostAddMainImageCommand>
{
  constructor(
    private readonly s3Adapter: S3Adapter,
    private readonly blogsQueryRepository: BlogsQueryRepository,
    private readonly postsQueryRepository: PostsQueryRepository,
    private readonly postsRepository: PostsRepository,
  ) {}

  async execute(
    command: PostAddMainImageCommand,
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

    const post = await this.postsQueryRepository.findPostEntity(
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

    if (blog.user.id !== +command.userId) {
      return {
        data: false,
        code: ResultCode.Forbidden,
      };
    }

    // Uploading original image
    const originalImageS3Key = `post/images/main/${command.postId}_original_${command.originalName}`;
    const uploadResult = await this.s3Adapter.uploadImage(
      originalImageS3Key,
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

    const originalImageSharpInstance = sharp(command.buffer);
    const originalImageMetadata = await originalImageSharpInstance.metadata();

    const largeImageResult = await this.postsRepository.uploadPostMainImage(
      originalImageMetadata,
      originalImageS3Key,
      post,
    );

    if (!largeImageResult) {
      return {
        data: false,
        code: ResultCode.NotFound,
        field: blogIdField,
        message: blogNotFound,
      };
    }

    // Uploading medium image
    const mediumImageBuffer = await sharp(command.buffer)
      .resize({ width: 300, height: 180 })
      .toBuffer();

    const mediumImageS3Key = `post/images/main/${command.postId}_middle_${command.originalName}`;
    const uploadResult2 = await this.s3Adapter.uploadImage(
      mediumImageS3Key,
      mediumImageBuffer,
      command.mimetype,
    );

    if (!uploadResult2) {
      return {
        data: false,
        code: ResultCode.BadRequest,
        field: 'Image',
        message: 'Incorrect Format',
      };
    }

    const mediumImageSharpInstance = sharp(mediumImageBuffer);
    const mediumImageMetadata = await mediumImageSharpInstance.metadata();

    const mediumImageResult = await this.postsRepository.uploadPostMainImage(
      mediumImageMetadata,
      mediumImageS3Key,
      post,
    );

    if (!mediumImageResult) {
      return {
        data: false,
        code: ResultCode.NotFound,
        field: blogIdField,
        message: blogNotFound,
      };
    }

    // Uploading small image
    const smallImageBuffer = await sharp(command.buffer)
      .resize({ width: 149, height: 96 })
      .toBuffer();

    const smallImageS3Key = `post/images/main/${command.postId}_small_${command.originalName}`;
    const uploadResult3 = await this.s3Adapter.uploadImage(
      smallImageS3Key,
      smallImageBuffer,
      command.mimetype,
    );

    if (!uploadResult3) {
      return {
        data: false,
        code: ResultCode.BadRequest,
        field: 'Image',
        message: 'Incorrect Format',
      };
    }

    const smallImageSharpInstance = sharp(smallImageBuffer);
    const smallImageMetadata = await smallImageSharpInstance.metadata();

    const smallImageResult = await this.postsRepository.uploadPostMainImage(
      smallImageMetadata,
      smallImageS3Key,
      post,
    );

    if (!smallImageResult) {
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
