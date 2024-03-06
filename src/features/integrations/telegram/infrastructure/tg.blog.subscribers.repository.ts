import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { TransactionHelper } from '../../../../base/transactions/transaction.helper';
import { TgBlogSubscriber } from '../domain/tg.blog.subscriber.entity';

@Injectable()
export class TgBlogSubscribersRepository {
  private readonly logger = new Logger(TgBlogSubscribersRepository.name);
  private readonly configService = new ConfigService();
  constructor(private readonly transactionHelper: TransactionHelper) {}

  async addTgIdToSubscriber(
    subscriber: TgBlogSubscriber,
    telegramId: number,
  ): Promise<boolean> {
    return this.transactionHelper.executeInTransaction(
      async (entityManager) => {
        subscriber.telegramId = telegramId;

        await entityManager.save(subscriber);

        return true;
      },
    );
  }
}
