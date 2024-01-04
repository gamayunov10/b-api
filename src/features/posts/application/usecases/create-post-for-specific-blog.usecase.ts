import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';

import { PostInputModel } from '../../api/models/input/post-input-model';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { BlogsQueryRepository } from '../../../blogs/infrastructure/blogs.query.repository';
import { ResultCode } from '../../../../base/enums/result-code.enum';
import { ExceptionResultType } from '../../../../infrastructure/types/exceptions.types';
import {
  blogIdField,
  blogNotFound,
} from '../../../../base/constants/constants';

export class PostCreatePostForSpecificBlogCommand {
  constructor(public postInputModel: PostInputModel, public blogId: string) {}
}

@CommandHandler(PostCreatePostForSpecificBlogCommand)
export class PostCreatePostForSpecificBlog
  implements ICommandHandler<PostCreatePostForSpecificBlogCommand>
{
  constructor(
    private readonly postsRepository: PostsRepository,
    private readonly blogsQueryRepository: BlogsQueryRepository,
  ) {}

  async execute(
    command: PostCreatePostForSpecificBlogCommand,
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

    const blogName = blog.name;

    const postId = await this.postsRepository.createPostForSpecificBlog(
      command.postInputModel,
      +command.blogId,
      blogName,
    );

    return {
      data: true,
      code: ResultCode.Success,
      response: postId,
    };
  }
}
