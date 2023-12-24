import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';

import { DevicesRepository } from '../../infrastructure/devices.repository';

export class LoginDeviceCommand {
  constructor(
    public token: string,
    public ip: string,
    public userAgent: string,
  ) {}
}

@CommandHandler(LoginDeviceCommand)
export class LoginDeviceUseCase implements ICommandHandler<LoginDeviceCommand> {
  constructor(
    private readonly devicesRepository: DevicesRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(command: LoginDeviceCommand): Promise<number> {
    const decodedToken = await this.jwtService.decode(command.token);

    return this.devicesRepository.createDevice(
      decodedToken,
      command.ip,
      command.userAgent,
    );
  }
}
