import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { DeviceViewModel } from '../api/models/output/device.view.model';
import { Device } from '../domain/device.entity';

@Injectable()
export class DevicesQueryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}
  async findActiveDevices(userId: string): Promise<DeviceViewModel[]> {
    const devices = await this.dataSource.query(
      `SELECT  ip, title, "lastActiveDate", "deviceId"
              FROM public.devices
              WHERE "userId" = $1;`,
      [userId],
    );

    return devices.map((device) => {
      return {
        ip: device.ip,
        title: device.title,
        lastActiveDate: device.lastActiveDate,
        deviceId: device.deviceId,
      };
    });
  }

  async findDeviceByUserId(userId: string): Promise<Device | null> {
    const devices = await this.dataSource.query(
      `SELECT "deviceId", "userId", "lastActiveDate", "expirationDate"
       FROM public.devices
       WHERE "userId" = $1;`,
      [userId],
    );

    if (devices.length === 0) {
      return null;
    }

    return devices[0];
  }
}
