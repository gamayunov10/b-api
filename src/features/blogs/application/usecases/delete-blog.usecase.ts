import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';

import { BlogsRepository } from '../../infrastructure/blogs.repository';
import { BlogsQueryRepository } from '../../infrastructure/blogs.query.repository';

export class BlogDeleteCommand {
  constructor(public blogId: string) {}
}

@CommandHandler(BlogDeleteCommand)
export class BlogDeleteUseCase implements ICommandHandler<BlogDeleteCommand> {
  constructor(
    private readonly blogsRepository: BlogsRepository,
    private readonly blogsQueryRepository: BlogsQueryRepository,
  ) {}

  async execute(command: BlogDeleteCommand): Promise<boolean> {
    if (isNaN(+command.blogId)) {
      throw new NotFoundException();
    }

    const blog = this.blogsQueryRepository.findBlogById(+command.blogId);

    if (!blog) {
      return null;
    }

    return this.blogsRepository.deleteBlog(+command.blogId);
  }
}
