import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';

import { BlogsQueryRepository } from '../../../blogs/infrastructure/blogs.query.repository';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { PostsQueryRepository } from '../../infrastructure/posts.query.repository';
import { ExceptionResultType } from '../../../../infrastructure/types/exceptions.types';
import { ResultCode } from '../../../../base/enums/result-code.enum';
import {
  blogIdField,
  blogNotFound,
  postIDField,
  postNotFound,
} from '../../../../base/constants/constants';

export class PostDeleteCommand {
  constructor(public blogId: string, public postId: string) {}
}

@CommandHandler(PostDeleteCommand)
export class PostDeleteUseCase implements ICommandHandler<PostDeleteCommand> {
  constructor(
    private readonly blogsQueryRepository: BlogsQueryRepository,
    private readonly postsRepository: PostsRepository,
    private readonly postsQueryRepository: PostsQueryRepository,
  ) {}

  async execute(
    command: PostDeleteCommand,
  ): Promise<ExceptionResultType<boolean>> {
    if (isNaN(+command.blogId) || isNaN(+command.postId)) {
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

    const postId = await this.postsQueryRepository.checkExistenceOfPost(
      +command.postId,
    );

    if (!postId) {
      return {
        data: false,
        code: ResultCode.NotFound,
        field: postIDField,
        message: postNotFound,
      };
    }

    await this.postsRepository.deletePost(+postId);

    return {
      data: true,
      code: ResultCode.Success,
    };
  }
}
