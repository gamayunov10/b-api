import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import * as bcrypt from 'bcrypt';

import { UserInputModel } from '../../api/models/input/user-input-model';
import { UsersRepository } from '../../infrastructure/users.repository';

export class UserCreateCommand {
  constructor(public userInputModel: UserInputModel) {}
}

@CommandHandler(UserCreateCommand)
export class UserCreateUseCase implements ICommandHandler<UserCreateCommand> {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(command: UserCreateCommand): Promise<number> {
    const hash = await bcrypt.hash(command.userInputModel.password, 10);
    return this.usersRepository.createUser(command.userInputModel, hash);
  }
}
