import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { randomUUID } from 'crypto';
import { UnauthorizedException } from '@nestjs/common';

import { TgBlogSubscribersQueryRepository } from '../../infrastructure/tg.blog.subscribers.query.repository';
import { UsersQueryRepository } from '../../../../users/infrastructure/users.query.repository';
import { ExceptionResultType } from '../../../../../infrastructure/types/exceptions.types';
import { ResultCode } from '../../../../../base/enums/result-code.enum';
import {
  userIdField,
  userNotFound,
} from '../../../../../base/constants/constants';
import { DataSourceRepository } from '../../../../../base/infrastructure/data-source.repository';
import { SubscribeStatus } from '../../../../../base/enums/SubscribeStatus.enum';
import { TgBlogSubscriber } from '../../domain/tg.blog.subscriber.entity';

export class TgBotGetAuthLinkQuery {
  constructor(public userId: string) {}
}

@QueryHandler(TgBotGetAuthLinkQuery)
export class TgBotGetAuthLinkQueryUseCase
  implements IQueryHandler<TgBotGetAuthLinkQuery>
{
  constructor(
    private readonly userQueryRepository: UsersQueryRepository,
    private readonly tgBlogSubscribersQueryRepository: TgBlogSubscribersQueryRepository,
    private readonly dataSourceRepository: DataSourceRepository,
  ) {}

  async execute(
    query: TgBotGetAuthLinkQuery,
  ): Promise<ExceptionResultType<boolean> | { link: string }> {
    if (isNaN(+query.userId)) {
      throw new UnauthorizedException();
    }

    const user =
      await this.userQueryRepository.findUserEntityByIdWithoutManager(
        +query.userId,
      );

    if (!user) {
      return {
        data: false,
        code: ResultCode.BadRequest,
        field: userIdField,
        message: userNotFound,
      };
    }

    const telegramCode = randomUUID();

    let subscriber =
      await this.tgBlogSubscribersQueryRepository.findActiveSubscriber(
        +query.userId,
      );

    if (!subscriber) {
      subscriber = new TgBlogSubscriber();
      subscriber.subscribeStatus = SubscribeStatus.NONE;
      subscriber.user = user;
    }

    subscriber.telegramCode = telegramCode;
    await this.dataSourceRepository.save(subscriber);

    return {
      link: `https://t.me/backend_master_bot?code=${subscriber.telegramCode}`,
    };
  }
}
