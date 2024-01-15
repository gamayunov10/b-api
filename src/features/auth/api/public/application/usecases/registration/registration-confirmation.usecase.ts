import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { ConfirmationCodeInputModel } from '../../../../../models/input/user-confirm.model';
import { UsersRepository } from '../../../../../../users/infrastructure/users.repository';
import { UsersQueryRepository } from '../../../../../../users/infrastructure/users.query.repository';

export class RegistrationConfirmationCommand {
  constructor(public confirmCodeInputModel: ConfirmationCodeInputModel) {}
}

@CommandHandler(RegistrationConfirmationCommand)
export class RegistrationConfirmationUseCase
  implements ICommandHandler<RegistrationConfirmationCommand>
{
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly usersQueryRepository: UsersQueryRepository,
  ) {}

  async execute(command: RegistrationConfirmationCommand): Promise<boolean> {
    const user =
      await this.usersQueryRepository.findUserByEmailConfirmationCode(
        command.confirmCodeInputModel.code,
      );

    if (!user || user.isConfirmed || user.expirationDate < new Date()) {
      return null;
    }

    return this.usersRepository.confirmUser(user.id);
  }
}
