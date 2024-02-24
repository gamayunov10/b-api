import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UnauthorizedException } from '@nestjs/common';

import { UserBanInputModel } from '../../api/models/input/user-ban.input.model';
import { UsersRepository } from '../../infrastructure/users.repository';
import { UsersQueryRepository } from '../../infrastructure/users.query.repository';
import { DevicesRepository } from '../../../devices/infrastructure/devices.repository';

export class UserBanCommand {
  constructor(
    public userInputModel: UserBanInputModel,
    public userId: string,
  ) {}
}

@CommandHandler(UserBanCommand)
export class UserBanUseCase implements ICommandHandler<UserBanCommand> {
  constructor(
    protected readonly usersRepository: UsersRepository,
    protected readonly usersQueryRepository: UsersQueryRepository,
    protected readonly devicesRepository: DevicesRepository,
  ) {}

  async execute(command: UserBanCommand): Promise<boolean> {
    if (isNaN(+command.userId)) {
      throw new UnauthorizedException();
    }

    const user = await this.usersQueryRepository.findUserById(+command.userId);

    if (!user) {
      return false;
    }

    if (command.userInputModel.isBanned === true) {
      const banRecordResult = await this.usersRepository.banUser(
        +command.userId,
        command.userInputModel,
      );

      const deleteDevicesResult =
        await this.devicesRepository.deleteAllBannedUserDevices(
          +command.userId,
        );

      if (!banRecordResult || !deleteDevicesResult) {
        return false;
      }
    } else {
      const banRecordResult = await this.usersRepository.unBanUser(
        +command.userId,
      );

      if (!banRecordResult) {
        return false;
      }
    }

    return true;
  }
}
