import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';

import { SendRegistrationMailCommand } from '../../../../../../mail/application/usecases/send-registration-mail.usecase';
import { UsersRepository } from '../../../../../../users/infrastructure/users.repository';
import { UserInputModel } from '../../../../../../users/api/models/input/user-input-model';

export class RegistrationCommand {
  constructor(public userInputModel: UserInputModel) {}
}

@CommandHandler(RegistrationCommand)
export class RegistrationUseCase
  implements ICommandHandler<RegistrationCommand>
{
  constructor(
    private commandBus: CommandBus,
    private readonly usersRepository: UsersRepository,
  ) {}

  async execute(command: RegistrationCommand): Promise<number | null> {
    const hash = await bcrypt.hash(command.userInputModel.password, 10);

    const code = randomUUID();

    const userId = await this.usersRepository.registerUser(
      command.userInputModel,
      hash,
      code,
    );

    try {
      await this.commandBus.execute(
        new SendRegistrationMailCommand(
          command.userInputModel.login,
          command.userInputModel.email,
          code,
        ),
      );
    } catch (error) {
      console.error(error);
      await this.usersRepository.deleteUser(userId);
      return null;
    }

    return userId;
  }
}
