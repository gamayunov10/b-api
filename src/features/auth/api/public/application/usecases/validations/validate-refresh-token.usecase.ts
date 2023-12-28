import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { DevicesRepository } from '../../../../../../devices/infrastructure/devices.repository';

export class ValidateRefreshTokenCommand {
  constructor(public payload: any) {}
}

@CommandHandler(ValidateRefreshTokenCommand)
export class ValidateRefreshTokenUseCase
  implements ICommandHandler<ValidateRefreshTokenCommand>
{
  constructor(private readonly devicesRepository: DevicesRepository) {}

  async execute(command: ValidateRefreshTokenCommand) {
    const device = await this.devicesRepository.findDevice(
      command.payload.deviceId,
    );

    const timestamp = command.payload.iat;
    const iatTimestamp = new Date(timestamp * 1000);

    if (!device || iatTimestamp < device.lastActiveDate) {
      return null;
    }

    return device;
  }
}
