import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { TgBlogSubscribersQueryRepository } from '../../infrastructure/tg.blog.subscribers.query.repository';
import { DataSourceRepository } from '../../../../../base/infrastructure/data-source.repository';

export class TgAddToNotificationsCommand {
  constructor(public telegramId: number, public telegramCode: string) {}
}

@CommandHandler(TgAddToNotificationsCommand)
export class TgAddToNotificationsWhitelistUseCase
  implements ICommandHandler<TgAddToNotificationsCommand>
{
  constructor(
    private readonly dataSourceRepository: DataSourceRepository,
    private readonly tgBlogSubscribersQueryRepository: TgBlogSubscribersQueryRepository,
  ) {}

  async execute(command: TgAddToNotificationsCommand) {
    const telegramIdIsRegistered =
      await this.tgBlogSubscribersQueryRepository.findTelegramId(
        command.telegramId,
      );

    if (telegramIdIsRegistered) {
      return false;
    }

    const startMessage = command.telegramCode.split('=');
    const codeToCheck = startMessage[1];

    const subscriber =
      await this.tgBlogSubscribersQueryRepository.findSubscriberByTelegramCode(
        codeToCheck,
      );

    if (!subscriber) {
      return false;
    }

    subscriber.telegramId = command.telegramId;
    return this.dataSourceRepository.save(subscriber);
  }
}
