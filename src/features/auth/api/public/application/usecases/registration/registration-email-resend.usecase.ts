import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { randomUUID } from 'crypto';

import { EmailInputModel } from '../../../../../models/email-input.model';
import { UsersRepository } from '../../../../../../users/infrastructure/users.repository';
import { SendRegistrationMailCommand } from '../../../../../../mail/application/usecases/send-registration-mail.usecase';

export class RegistrationEmailResendCommand {
  constructor(public emailInputModel: EmailInputModel) {}
}

@CommandHandler(RegistrationEmailResendCommand)
export class RegistrationEmailResendUseCase
  implements ICommandHandler<RegistrationEmailResendCommand>
{
  constructor(
    private commandBus: CommandBus,
    private readonly usersRepository: UsersRepository,
  ) {}

  async execute(command: RegistrationEmailResendCommand): Promise<boolean> {
    const user = await this.usersRepository.findUserForEmailResending(
      command.emailInputModel.email,
    );

    if (!user || user.isConfirmed) {
      return null;
    }

    const newConfirmationCode = randomUUID();

    const result = await this.usersRepository.updateEmailConfirmationCode(
      newConfirmationCode,
      user.id,
    );

    try {
      await this.commandBus.execute(
        new SendRegistrationMailCommand(
          user.login,
          user.email,
          newConfirmationCode,
        ),
      );
    } catch (error) {
      console.error(error);
      return null;
    }

    return result;
  }
}
