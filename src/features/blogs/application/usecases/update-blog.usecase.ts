import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { BlogsRepository } from '../../infrastructure/blogs.repository';
import { BlogInputModel } from '../../api/models/input/blog-input-model';

export class BlogUpdateCommand {
  constructor(public blogInputModel: BlogInputModel, public blogId: string) {}
}

@CommandHandler(BlogUpdateCommand)
export class BlogUpdateUseCase implements ICommandHandler<BlogUpdateCommand> {
  constructor(private readonly blogsRepository: BlogsRepository) {}

  async execute(command: BlogUpdateCommand): Promise<boolean> {
    return this.blogsRepository.updateBlog(
      command.blogInputModel,
      +command.blogId,
    );
  }
}
