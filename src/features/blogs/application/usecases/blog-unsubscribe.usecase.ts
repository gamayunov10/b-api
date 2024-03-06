import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';

import { BlogsQueryRepository } from '../../infrastructure/blogs.query.repository';
import { TgBlogSubscribersQueryRepository } from '../../../integrations/telegram/infrastructure/tg.blog.subscribers.query.repository';
import { UsersQueryRepository } from '../../../users/infrastructure/users.query.repository';
import { ExceptionResultType } from '../../../../infrastructure/types/exceptions.types';
import { ResultCode } from '../../../../base/enums/result-code.enum';
import {
  blogIdField,
  blogNotFound,
  userIdField,
  userNotFound,
} from '../../../../base/constants/constants';
import { DataSourceRepository } from '../../../../base/infrastructure/data-source.repository';
import { SubscribeStatus } from '../../../../base/enums/SubscribeStatus.enum';

export class BlogUnsubscribeCommand {
  constructor(public blogId: string, public userId: string) {}
}

@CommandHandler(BlogUnsubscribeCommand)
export class BlogUnsubscribeUseCase
  implements ICommandHandler<BlogUnsubscribeCommand>
{
  constructor(
    private readonly blogsQueryRepository: BlogsQueryRepository,
    private readonly tgBlogSubscribersQueryRepository: TgBlogSubscribersQueryRepository,
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly dataSourceRepository: DataSourceRepository,
  ) {}

  async execute(
    command: BlogUnsubscribeCommand,
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

    const subscriber =
      await this.tgBlogSubscribersQueryRepository.findRecordForSubscribe(
        +command.blogId,
        +command.userId,
      );

    if (subscriber) {
      subscriber.subscribeStatus = SubscribeStatus.UNSUBSCRIBED;
      await this.dataSourceRepository.save(subscriber);
    }

    return {
      data: true,
      code: ResultCode.Success,
    };
  }
}
