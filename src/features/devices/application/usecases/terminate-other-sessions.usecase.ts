import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { DevicesRepository } from '../../infrastructure/devices.repository';

export class TerminateOtherSessionsCommand {
  constructor(public deviceId: number, public userId: number) {}
}

@CommandHandler(TerminateOtherSessionsCommand)
export class TerminateOtherSessionsUseCase
  implements ICommandHandler<TerminateOtherSessionsCommand>
{
  constructor(private readonly devicesRepository: DevicesRepository) {}

  async execute(command: TerminateOtherSessionsCommand): Promise<boolean> {
    return this.devicesRepository.deleteOthers(command.deviceId);
  }
}
