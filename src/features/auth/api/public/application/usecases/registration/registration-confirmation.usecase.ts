import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { ConfirmationCodeInputModel } from '../../../../../models/user-confirm.model';
import { UsersRepository } from '../../../../../../users/infrastructure/users.repository';

export class RegistrationConfirmationCommand {
  constructor(public confirmCodeInputModel: ConfirmationCodeInputModel) {}
}

@CommandHandler(RegistrationConfirmationCommand)
export class RegistrationConfirmationUseCase
  implements ICommandHandler<RegistrationConfirmationCommand>
{
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(command: RegistrationConfirmationCommand): Promise<boolean> {
    const user = await this.usersRepository.findUserByEmailConfirmationCode(
      command.confirmCodeInputModel.code,
    );

    if (!user || user.isConfirmed || user.expirationDate < new Date()) {
      return null;
    }

    return this.usersRepository.confirmUser(user.id);
  }
}
