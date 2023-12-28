import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { deviceIDField, deviceNotFound } from 'src/base/constants/constants';
import { ResultCode } from 'src/base/enums/result-code.enum';
import { ExceptionResultType } from 'src/infrastructure/types/exceptions.types';
import { ForbiddenException } from '@nestjs/common';

import { DevicesRepository } from '../../infrastructure/devices.repository';

export class TerminateSessionCommand {
  constructor(public deviceId: string, public userId: string) {}
}

@CommandHandler(TerminateSessionCommand)
export class TerminateSessionUseCase
  implements ICommandHandler<TerminateSessionCommand>
{
  constructor(private readonly devicesRepository: DevicesRepository) {}

  async execute(
    command: TerminateSessionCommand,
  ): Promise<ExceptionResultType<boolean>> {
    const deviceId = +command.deviceId;
    const userId = +command.userId;

    const device = await this.devicesRepository.findDevice(deviceId);

    if (!device) {
      return {
        data: false,
        code: ResultCode.NotFound,
        field: deviceIDField,
        message: deviceNotFound,
      };
    }

    if (+device.deviceId !== userId) {
      throw new ForbiddenException();
    }

    await this.devicesRepository.deleteDevice(+command.deviceId);

    return {
      data: true,
      code: ResultCode.Success,
    };
  }
}
