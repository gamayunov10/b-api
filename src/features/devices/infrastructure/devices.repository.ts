import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';

import { DeviceAuthSessions } from '../domain/device.entity';
import { TransactionHelper } from '../../../base/transactions/transaction.helper';

@Injectable()
export class DevicesRepository {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    private readonly transactionHelper: TransactionHelper,
  ) {}

  async createDevice(
    decodedToken: any,
    ip: string,
    userAgent: string,
  ): Promise<number> {
    const iatDate = new Date(decodedToken.iat * 1000).toISOString();
    const expDate = new Date(decodedToken.exp * 1000).toISOString();

    const device = await this.dataSource
      .createQueryBuilder()
      .insert()
      .into(DeviceAuthSessions)
      .values({
        deviceId: decodedToken.deviceId,
        ip: ip,
        title: userAgent,
        lastActiveDate: iatDate,
        expirationDate: expDate,
        userId: decodedToken.userId,
      })
      .returning('id')
      .execute();

    return device.identifiers[0].id;
  }

  async updateDevice(
    deviceId: string,
    token: any,
    ip: string,
    userAgent: string,
  ): Promise<boolean> {
    const result = await this.dataSource
      .createQueryBuilder()
      .update(DeviceAuthSessions)
      .set({
        lastActiveDate: () => 'to_timestamp(:iat)',
        ip: ':ip',
        title: ':userAgent',
      })
      .where('"deviceId" = :deviceId', { deviceId })
      .setParameters({ deviceId, iat: token.iat, ip, userAgent })
      .execute();

    return result.affected === 1;
  }

  async deleteDevice(deviceId: string): Promise<boolean> {
    const result = await this.dataSource
      .createQueryBuilder()
      .delete()
      .from(DeviceAuthSessions)
      .where('"deviceId" = :deviceId', { deviceId })
      .execute();

    return result.affected === 1;
  }

  async deleteOthers(deviceId: number): Promise<boolean> {
    const result = await this.dataSource
      .createQueryBuilder()
      .delete()
      .from(DeviceAuthSessions)
      .where('"deviceId" != :deviceId', { deviceId })
      .execute();

    return result.affected === 1;
  }

  async deleteAllBannedUserDevices(userId: number): Promise<boolean> {
    return this.transactionHelper.executeInTransaction(
      async (entityManager) => {
        await entityManager
          .createQueryBuilder()
          .delete()
          .from(DeviceAuthSessions)
          .where('userId = :userId', { userId })
          .execute();

        return true;
      },
    );
  }
}
