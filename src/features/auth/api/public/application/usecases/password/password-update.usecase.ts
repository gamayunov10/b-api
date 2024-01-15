import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import * as bcrypt from 'bcrypt';

import { NewPasswordModel } from '../../../../../models/input/new-password.model';
import { UsersRepository } from '../../../../../../users/infrastructure/users.repository';
import { UsersQueryRepository } from '../../../../../../users/infrastructure/users.query.repository';

export class PasswordUpdateCommand {
  constructor(public newPasswordModel: NewPasswordModel) {}
}

@CommandHandler(PasswordUpdateCommand)
export class PasswordUpdateUseCase
  implements ICommandHandler<PasswordUpdateCommand>
{
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly usersQueryRepository: UsersQueryRepository,
  ) {}

  async execute(command: PasswordUpdateCommand): Promise<boolean> {
    const user = await this.usersQueryRepository.findPasswordRecoveryRecord(
      command.newPasswordModel.recoveryCode,
    );

    if (!user || user.expirationDate < new Date()) {
      return null;
    }

    const hash = await bcrypt.hash(command.newPasswordModel.newPassword, 10);

    return this.usersRepository.updatePassword(user.userId, hash);
  }
}
