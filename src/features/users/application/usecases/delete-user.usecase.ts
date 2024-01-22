import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';

import { UsersRepository } from '../../infrastructure/users.repository';
import { UsersQueryRepository } from '../../infrastructure/users.query.repository';

export class UserDeleteCommand {
  constructor(public userId: string) {}
}

@CommandHandler(UserDeleteCommand)
export class UserDeleteUseCase implements ICommandHandler<UserDeleteCommand> {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly usersQueryRepository: UsersQueryRepository,
  ) {}

  async execute(command: UserDeleteCommand): Promise<boolean> {
    if (isNaN(+command.userId)) {
      throw new NotFoundException();
    }

    const user = await this.usersQueryRepository.findUserById(+command.userId);

    if (!user) {
      return null;
    }

    return this.usersRepository.deleteUser(+command.userId);
  }
}
