import { Injectable, NestMiddleware, NotFoundException } from '@nestjs/common';

import { DevicesRepository } from '../../features/devices/infrastructure/devices.repository';

@Injectable()
export class IsDeviceExist implements NestMiddleware {
  constructor(private readonly devicesRepository: DevicesRepository) {}
  async use(req, res, next): Promise<void> {
    const device = await this.devicesRepository.findDevice(req.params.id);

    if (!device) {
      throw new NotFoundException();
    }

    return next();
  }
}
