import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { randomUUID } from 'crypto';

import { EmailInputModel } from '../../../../../models/email-input.model';
import { UsersRepository } from '../../../../../../users/infrastructure/users.repository';
import { SendPasswordRecoveryMailCommand } from '../../../../../../mail/application/usecases/send-pass-recovery-mail.usecase';
import { UsersQueryRepository } from '../../../../../../users/infrastructure/users.query.repository';

export class PasswordRecoveryCommand {
  constructor(public emailInputModel: EmailInputModel) {}
}

@CommandHandler(PasswordRecoveryCommand)
export class PasswordRecoveryUseCase
  implements ICommandHandler<PasswordRecoveryCommand>
{
  constructor(
    private commandBus: CommandBus,
    private readonly usersRepository: UsersRepository,
    private readonly usersQueryRepository: UsersQueryRepository,
  ) {}

  async execute(command: PasswordRecoveryCommand): Promise<number> {
    const user = await this.usersQueryRepository.findUserByEmail(
      command.emailInputModel.email,
    );

    if (!user) {
      return null;
    }

    const recoveryCode = randomUUID();

    const result = await this.usersRepository.createPasswordRecoveryRecord(
      recoveryCode,
      user.id,
    );

    try {
      await this.commandBus.execute(
        new SendPasswordRecoveryMailCommand(
          user.login,
          user.email,
          recoveryCode,
        ),
      );
    } catch (error) {
      console.error(error);
      return null;
    }

    return result;
  }
}
