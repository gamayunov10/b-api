import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { DeviceViewModel } from '../api/models/output/device.view.model';
import { DeviceAuthSessions } from '../domain/device.entity';

@Injectable()
export class DevicesQueryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async findActiveDevices(userId: string): Promise<DeviceViewModel[]> {
    return await this.dataSource
      .createQueryBuilder()
      .select([
        'd.ip as ip',
        'd.title as title',
        'd.lastActiveDate as "lastActiveDate"',
        'd.deviceId as "deviceId"',
      ])
      .from(DeviceAuthSessions, 'd')
      .where('d."userId" = :userId', { userId })
      .getRawMany();
  }

  async findDeviceByDeviceId(
    deviceId: string,
  ): Promise<DeviceAuthSessions | null> {
    const devices = await this.dataSource
      .createQueryBuilder()
      .select([
        'd.deviceId as "deviceId"',
        'd.userId as "userId"',
        'd.lastActiveDate as "lastActiveDate"',
        'd.expirationDate as "expirationDate"',
      ])
      .from(DeviceAuthSessions, 'd')
      .where('d."deviceId" = :deviceId', { deviceId })
      .getRawOne();

    if (!devices) {
      return null;
    }

    return devices;
  }

  async findDeviceByUserId(userId: number): Promise<DeviceAuthSessions | null> {
    const devices = await this.dataSource
      .createQueryBuilder()
      .select([
        'd.deviceId as "deviceId"',
        'd.userId as "userId"',
        'd.lastActiveDate as "lastActiveDate"',
        'd.expirationDate as "expirationDate"',
      ])
      .from(DeviceAuthSessions, 'd')
      .where('d."userId" = :userId', { userId })
      .getRawOne();

    if (!devices) {
      return null;
    }

    return devices;
  }
}
