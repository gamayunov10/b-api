import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';

import { DeviceAuthSessions } from '../domain/device.entity';

@Injectable()
export class DevicesRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async dataSourceSave(
    entity: DeviceAuthSessions,
  ): Promise<DeviceAuthSessions> {
    return this.dataSource.manager.save(entity);
  }

  async createDevice(
    decodedToken: any,
    ip: string,
    userAgent: string,
  ): Promise<number> {
    const iatDate = new Date(decodedToken.iat * 1000).toISOString();
    const expDate = new Date(decodedToken.exp * 1000).toISOString();

    const device = await this.dataSource.query(
      `INSERT INTO public.device_auth_sessions
                ("deviceId", ip, title, "lastActiveDate", "expirationDate", "userId")
              VALUES ($1, $2, $3, $4, $5, $6)
              RETURNING id;`,
      [
        decodedToken.deviceId,
        ip,
        userAgent,
        iatDate,
        expDate,
        decodedToken.userId,
      ],
    );

    return device[0].id;
  }

  async updateDevice(
    deviceId: string,
    token: any,
    ip: string,
    userAgent: string,
  ): Promise<boolean> {
    const result = await this.dataSource.query(
      `UPDATE public.device_auth_sessions
              SET "lastActiveDate" = to_timestamp($2),
              ip = $3,
              title = $4
              WHERE "deviceId" = $1;`,
      [deviceId, token.iat, ip, userAgent],
    );

    return result[1] === 1;
  }

  async deleteDevice(deviceId: string): Promise<boolean> {
    const result = await this.dataSource.query(
      `DELETE
              FROM public.device_auth_sessions
              WHERE "deviceId" = $1;`,
      [deviceId],
    );
    return result[1] === 1;
  }

  async deleteOthers(deviceId: number): Promise<boolean> {
    return this.dataSource.query(
      `DELETE
      FROM public.device_auth_sessions
      WHERE "deviceId" != $1;`,
      [deviceId],
    );
  }
}
