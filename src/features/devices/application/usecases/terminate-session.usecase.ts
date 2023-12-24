import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { deviceIDField, deviceNotFound } from 'src/base/constants/constants';
import { ResultCode } from 'src/base/enums/result-code.enum';
import { ExceptionResultType } from 'src/infrastructure/types/exceptions.types';

import { DevicesRepository } from '../../infrastructure/devices.repository';

export class TerminateSessionCommand {
  constructor(public deviceId: number, public userId: number) {}
}

@CommandHandler(TerminateSessionCommand)
export class TerminateSessionUseCase
  implements ICommandHandler<TerminateSessionCommand>
{
  constructor(private readonly devicesRepository: DevicesRepository) {}

  async execute(
    command: TerminateSessionCommand,
  ): Promise<ExceptionResultType<boolean>> {
    const device = await this.devicesRepository.findDevice(command.deviceId);

    if (!device) {
      return {
        data: false,
        code: ResultCode.NotFound,
        field: deviceIDField,
        message: deviceNotFound,
      };
    }

    if (device.id !== command.userId) {
      return {
        data: false,
        code: ResultCode.Forbidden,
      };
    }

    await this.devicesRepository.deleteDevice(command.deviceId);

    return {
      data: true,
      code: ResultCode.Success,
    };
  }
}
