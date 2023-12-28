import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';

import { Device } from '../domain/device.entity';

@Injectable()
export class DevicesRepository {
  constructor(
    @InjectRepository(Device)
    private readonly devicesRepository: Repository<Device>,
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  async dataSourceSave(entity: Device): Promise<Device> {
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
      `INSERT INTO public.devices
                (ip, title, "lastActiveDate", "expirationDate", "deviceId")
              VALUES ($1, $2, $3, $4, $5)
              RETURNING id;`,
      [ip, userAgent, iatDate, expDate, decodedToken.userId],
    );

    return device[0].id;
  }

  async findDevice(deviceId: number): Promise<Device | null> {
    const devices = await this.dataSource.query(
      `SELECT id, "deviceId", "lastActiveDate"
       FROM public.devices
       WHERE "deviceId" = $1`,
      [deviceId],
    );

    if (devices.length === 0) {
      return null;
    }

    return devices[0];
  }

  async updateDevice(
    deviceId: number,
    token: any,
    ip: string,
    userAgent: string,
  ): Promise<boolean> {
    const result = await this.dataSource.query(
      `UPDATE public.devices
              SET "lastActiveDate" = to_timestamp($2),
              ip = $3,
              title = $4
              WHERE "deviceId" = $1;`,
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
