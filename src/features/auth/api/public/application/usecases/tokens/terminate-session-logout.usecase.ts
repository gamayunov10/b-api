import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { DevicesRepository } from '../../../../../../devices/infrastructure/devices.repository';
import { TerminateSessionCommand } from '../../../../../../devices/application/usecases/terminate-session.usecase';
import { ExceptionResultType } from '../../../../../../../infrastructure/types/exceptions.types';
import { ResultCode } from '../../../../../../../base/enums/result-code.enum';
import {
  deviceIDField,
  deviceNotFound,
} from '../../../../../../../base/constants/constants';

export class TerminateSessionLogoutCommand {
  constructor(public deviceId: string) {}
}

@CommandHandler(TerminateSessionLogoutCommand)
export class TerminateSessionLogoutUseCase
  implements ICommandHandler<TerminateSessionLogoutCommand>
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

    await this.devicesRepository.deleteDevice(command.deviceId);

    return {
      data: true,
      code: ResultCode.Success,
    };
  }
}
