import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { DevicesQueryRepository } from '../../../../../../devices/infrastructure/devices.query.repository';

export class ValidateRefreshTokenCommand {
  constructor(public payload: any) {}
}

@CommandHandler(ValidateRefreshTokenCommand)
export class ValidateRefreshTokenUseCase
  implements ICommandHandler<ValidateRefreshTokenCommand>
{
  constructor(
    private readonly devicesQueryRepository: DevicesQueryRepository,
  ) {}

  async execute(command: ValidateRefreshTokenCommand) {
    const device = await this.devicesQueryRepository.findDeviceByDeviceId(
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
