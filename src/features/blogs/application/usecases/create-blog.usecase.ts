import { CommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';

import { BlogsRepository } from '../../infrastructure/blogs.repository';
import { BlogInputModel } from '../../api/models/input/blog-input-model';
import { UsersQueryRepository } from '../../../users/infrastructure/users.query.repository';
import { TransactionBaseUseCase } from '../../../../base/application/usecases/transaction-base.usecase';
import { TransactionsRepository } from '../../../../base/infrastructure/transactions.repository';
import { Blog } from '../../domain/blog.entity';

export class BlogCreateCommand {
  constructor(public blogInputModel: BlogInputModel, public userId: string) {}
}

@CommandHandler(BlogCreateCommand)
export class BlogCreateUseCase extends TransactionBaseUseCase<
  BlogCreateCommand,
  number | null
> {
  constructor(
    protected readonly dataSource: DataSource,
    protected readonly transactionsRepository: TransactionsRepository,
    private readonly blogsRepository: BlogsRepository,
    private readonly usersQueryRepository: UsersQueryRepository,
  ) {
    super(dataSource);
  }

  async doLogic(
    command: BlogCreateCommand,
    manager: EntityManager,
  ): Promise<number | null> {
    if (isNaN(+command.userId)) {
      throw new NotFoundException();
    }

    const user = await this.usersQueryRepository.findUserEntityById(
      command.userId,
      manager,
    );

    if (!user) {
      return null;
    }

    const blog = new Blog();
    blog.user = user;
    blog.name = command.blogInputModel.name;
    blog.description = command.blogInputModel.description;
    blog.websiteUrl = command.blogInputModel.websiteUrl;
    blog.createdAt = new Date();
    blog.isMembership = false;

    const newBlog = await this.transactionsRepository.save(blog, manager);

    return +newBlog.id;
  }

  public async execute(command: BlogCreateCommand) {
    return super.execute(command);
  }
}
