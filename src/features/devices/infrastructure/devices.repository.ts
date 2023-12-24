import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { isValidUuid } from 'src/base/utils/is-valid-uuid';

import { Device } from '../domain/device.entity';

@Injectable()
export class DevicesRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async createDevice(
    decodedToken: any,
    ip: string,
    userAgent: string,
  ): Promise<number> {
    const iatDate = new Date(decodedToken.iat * 1000).toISOString();
    const expDate = new Date(decodedToken.exp * 1000).toISOString();

    const device = await this.dataSource.query(
      `INSERT INTO public.devices
                ("userId", "deviceId", ip, title, "lastActiveDate", "expirationDate")
              VALUES ($1, $2, $3, $4, $5, $6)
              RETURNING id`,
      [
        decodedToken.sub,
        decodedToken.deviceId,
        ip,
        userAgent,
        iatDate,
        expDate,
      ],
    );
    return device[0].id;
  }

  async findDevice(deviceId: number): Promise<Device | null> {
    if (!isValidUuid(deviceId)) {
      return null;
    }

    const device = await this.dataSource.query(
      `SELECT id, "userId", "deviceId", "lastActiveDate"
       FROM public.devices
       WHERE "deviceId" = $1`,
      [deviceId],
    );

    if (device.length === 0) {
      return null;
    }

    return device[0];
  }

  async updateDevice(
    deviceId: number,
    token: any,
    ip: string,
    userAgent: string,
  ): Promise<boolean> {
    const result = await this.dataSource.query(
      `UPDATE public.devices
              SET "lastActiveDate" = $2,
              ip = $3,
              title = $4,
              WHERE "deviceId" = $1`,
      [deviceId, token.iat, ip, userAgent],
    );
    return result[1] === 1;
  }

  async deleteDevice(deviceId: number): Promise<boolean> {
    const result = await this.dataSource.query(
      `DELETE
              FROM public.devices
              WHERE "deviceId" = $1;`,
      [deviceId],
    );
    return result[1] === 1;
  }

  async deleteOthers(deviceId: number): Promise<boolean> {
    return this.dataSource.query(
      `DELETE
      FROM public.devices
      WHERE "deviceId" != $1;`,
      [deviceId],
    );
  }
}
