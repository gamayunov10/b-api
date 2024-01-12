import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

import { PostInputModel } from '../../api/models/input/post-input-model';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { ExceptionResultType } from '../../../../infrastructure/types/exceptions.types';
import { BlogsQueryRepository } from '../../../blogs/infrastructure/blogs.query.repository';
import { ResultCode } from '../../../../base/enums/result-code.enum';
import {
  blogIdField,
  blogNotFound,
  postIDField,
  postNotFound,
} from '../../../../base/constants/constants';
import { PostsQueryRepository } from '../../infrastructure/posts.query.repository';
import { Role } from '../../../../base/enums/roles.enum';

export class PostUpdatePostForSpecificBlogCommand {
  constructor(
    public postInputModel: PostInputModel,
    public blogId: string,
    public postId: string,
    public blogOwner: Role | number,
  ) {}
}

@CommandHandler(PostUpdatePostForSpecificBlogCommand)
export class PostUpdatePostForSpecificBlogUseCase
  implements ICommandHandler<PostUpdatePostForSpecificBlogCommand>
{
  constructor(
    private readonly blogsQueryRepository: BlogsQueryRepository,
    private readonly postsRepository: PostsRepository,
    private readonly postsQueryRepository: PostsQueryRepository,
  ) {}

  async execute(
    command: PostUpdatePostForSpecificBlogCommand,
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

    const post = await this.postsQueryRepository.findPostByPostId(
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

    if (
      typeof command.blogOwner === 'number' &&
      command.blogOwner !== +blog.id
    ) {
      throw new ForbiddenException();
    }

    await this.postsRepository.updatePost(command.postInputModel, +post.id);

    return {
      data: true,
      code: ResultCode.Success,
    };
  }
}
