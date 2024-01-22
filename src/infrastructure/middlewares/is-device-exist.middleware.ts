import { Injectable, NestMiddleware, NotFoundException } from '@nestjs/common';

import { DevicesQueryRepository } from '../../features/devices/infrastructure/devices.query.repository';

@Injectable()
export class IsDeviceExist implements NestMiddleware {
  constructor(
    private readonly devicesQueryRepository: DevicesQueryRepository,
  ) {}
  async use(req, res, next): Promise<void> {
    const device = await this.devicesQueryRepository.findDeviceByDeviceId(
      req.params.id,
    );

    if (!device) {
      throw new NotFoundException();
    }

    return next();
  }
}
