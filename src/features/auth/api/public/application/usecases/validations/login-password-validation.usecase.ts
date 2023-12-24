import bcrypt from 'bcrypt';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { UsersRepository } from '../../../../../../users/infrastructure/users.repository';

export class LoginAndPasswordValidationCommand {
  constructor(public loginOrEmail: string, public password: string) {}
}

@CommandHandler(LoginAndPasswordValidationCommand)
export class LoginAndPasswordValidationUseCase
  implements ICommandHandler<LoginAndPasswordValidationCommand>
{
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(command: LoginAndPasswordValidationCommand) {
    const user = await this.usersRepository.findUserByLoginOrEmail(
      command.loginOrEmail,
    );

    if (!user || user.isConfirmed) {
      return null;
    }

    const result = await bcrypt.compare(command.password, user.passwordHash);

    if (result) {
      return user;
    }

    return null;
  }
}
