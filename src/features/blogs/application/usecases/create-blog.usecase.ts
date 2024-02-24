import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';

import { BlogsRepository } from '../../infrastructure/blogs.repository';
import { BlogInputModel } from '../../api/models/input/blog-input-model';
import { UsersQueryRepository } from '../../../users/infrastructure/users.query.repository';

export class BlogCreateCommand {
  constructor(public blogInputModel: BlogInputModel, public userId: string) {}
}

@CommandHandler(BlogCreateCommand)
export class BlogCreateUseCase implements ICommandHandler<BlogCreateCommand> {
  constructor(
    private readonly blogsRepository: BlogsRepository,
    private readonly usersQueryRepository: UsersQueryRepository,
  ) {}

  async execute(command: BlogCreateCommand): Promise<number | boolean> {
    if (isNaN(+command.userId)) {
      throw new NotFoundException();
    }

    const user =
      await this.usersQueryRepository.findUserEntityByIdWithoutManager(
        +command.userId,
      );

    if (!user) {
      return false;
    }

    return await this.blogsRepository.createBlog(command.blogInputModel, user);
  }
}
