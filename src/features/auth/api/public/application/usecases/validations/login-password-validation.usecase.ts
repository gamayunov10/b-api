import bcrypt from 'bcrypt';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { UsersQueryRepository } from '../../../../../../users/infrastructure/users.query.repository';

export class LoginAndPasswordValidationCommand {
  constructor(public loginOrEmail: string, public password: string) {}
}

@CommandHandler(LoginAndPasswordValidationCommand)
export class LoginAndPasswordValidationUseCase
  implements ICommandHandler<LoginAndPasswordValidationCommand>
{
  constructor(private readonly usersQueryRepository: UsersQueryRepository) {}

  async execute(command: LoginAndPasswordValidationCommand) {
    const user = await this.usersQueryRepository.findUserByLoginOrEmail(
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
