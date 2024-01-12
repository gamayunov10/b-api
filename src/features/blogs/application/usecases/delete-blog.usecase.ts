import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

import { BlogsRepository } from '../../infrastructure/blogs.repository';
import { BlogsQueryRepository } from '../../infrastructure/blogs.query.repository';
import { Role } from '../../../../base/enums/roles.enum';

export class BlogDeleteCommand {
  constructor(public blogId: string, public blogOwner: Role | number) {}
}

@CommandHandler(BlogDeleteCommand)
export class BlogDeleteUseCase implements ICommandHandler<BlogDeleteCommand> {
  constructor(
    private readonly blogsRepository: BlogsRepository,
    private readonly blogsQueryRepository: BlogsQueryRepository,
  ) {}

  async execute(command: BlogDeleteCommand): Promise<boolean | null> {
    if (isNaN(+command.blogId)) {
      throw new NotFoundException();
    }

    const blog = await this.blogsQueryRepository.findBlogById(+command.blogId);

    if (!blog) {
      return null;
    }

    if (
      typeof command.blogOwner === 'number' &&
      command.blogOwner !== +blog.id
    ) {
      throw new ForbiddenException();
    }

    return await this.blogsRepository.deleteBlog(+command.blogId);
  }
}
