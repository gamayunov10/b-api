import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';

import { ExceptionResultType } from '../../../../infrastructure/types/exceptions.types';
import { BlogsQueryRepository } from '../../infrastructure/blogs.query.repository';
import { ResultCode } from '../../../../base/enums/result-code.enum';
import {
  blogIdField,
  blogNotFound,
  userIdField,
  userNotFound,
} from '../../../../base/constants/constants';
import { UsersQueryRepository } from '../../../users/infrastructure/users.query.repository';
import { TgBlogSubscribersQueryRepository } from '../../../integrations/telegram/infrastructure/tg.blog.subscribers.query.repository';
import { TgBlogSubscriber } from '../../../integrations/telegram/domain/tg.blog.subscriber.entity';
import { SubscribeStatus } from '../../../../base/enums/SubscribeStatus.enum';
import { DataSourceRepository } from '../../../../base/infrastructure/data-source.repository';

export class BlogSubscribeCommand {
  constructor(public blogId: string, public userId: string) {}
}

@CommandHandler(BlogSubscribeCommand)
export class BlogSubscribeUseCase
  implements ICommandHandler<BlogSubscribeCommand>
{
  constructor(
    private readonly blogsQueryRepository: BlogsQueryRepository,
    private readonly tgBlogSubscribersQueryRepository: TgBlogSubscribersQueryRepository,
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly dataSourceRepository: DataSourceRepository,
  ) {}

  async execute(
    command: BlogSubscribeCommand,
  ): Promise<ExceptionResultType<boolean>> {
    if (isNaN(+command.userId)) {
      throw new UnauthorizedException();
    }

    if (isNaN(+command.blogId)) {
      throw new NotFoundException();
    }

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

    const user =
      await this.usersQueryRepository.findUserEntityByIdWithoutManager(
        +command.userId,
      );

    if (!user) {
      return {
        data: false,
        code: ResultCode.NotFound,
        field: userIdField,
        message: userNotFound,
      };
    }

    let subscriber =
      await this.tgBlogSubscribersQueryRepository.findRecordForSubscribe(
        +command.blogId,
        +command.userId,
      );

    if (!subscriber) {
      subscriber = new TgBlogSubscriber();
      subscriber.user = user;
    }

    subscriber.subscribeStatus = SubscribeStatus.SUBSCRIBED;
    subscriber.blog = blog;

    await this.dataSourceRepository.save(subscriber);

    return {
      data: true,
      code: ResultCode.Success,
    };
  }
}
