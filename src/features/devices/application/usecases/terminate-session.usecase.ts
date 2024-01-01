import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException } from '@nestjs/common';

import { DevicesRepository } from '../../infrastructure/devices.repository';
import { ExceptionResultType } from '../../../../infrastructure/types/exceptions.types';
import { ResultCode } from '../../../../base/enums/result-code.enum';
import {
  deviceIDField,
  deviceNotFound,
} from '../../../../base/constants/constants';
import { DevicesQueryRepository } from '../../infrastructure/devices.query.repository';

export class TerminateSessionCommand {
  constructor(public deviceId: string, public userId: string) {}
}

@CommandHandler(TerminateSessionCommand)
export class TerminateSessionUseCase
  implements ICommandHandler<TerminateSessionCommand>
{
  constructor(
    private readonly devicesRepository: DevicesRepository,
    private readonly devicesQueryRepository: DevicesQueryRepository,
  ) {}

  async execute(
    command: TerminateSessionCommand,
  ): Promise<ExceptionResultType<boolean>> {
    const deviceByParam = await this.devicesRepository.findDevice(
      command.deviceId,
    );

    const deviceByToken =
      await this.devicesQueryRepository.findDeviceIdByUserId(command.userId);

    if (!deviceByParam || !deviceByToken) {
      return {
        data: false,
        code: ResultCode.NotFound,
        field: deviceIDField,
        message: deviceNotFound,
      };
    }

    if (deviceByToken.userId !== deviceByParam.userId) {
      throw new ForbiddenException();
    }

    await this.devicesRepository.deleteDevice(command.deviceId);

    return {
      data: true,
      code: ResultCode.Success,
    };
  }
}
