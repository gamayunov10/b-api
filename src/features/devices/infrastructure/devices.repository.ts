import { Injectable, Logger } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

import { DeviceAuthSessions } from '../domain/device.entity';

@Injectable()
export class DevicesRepository {
  private readonly logger = new Logger(DevicesRepository.name);
  constructor(
    @InjectRepository(DeviceAuthSessions)
    private readonly devicesRepository: Repository<DeviceAuthSessions>,
    @InjectDataSource() private dataSource: DataSource,
    private readonly configService: ConfigService,
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
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager
        .createQueryBuilder()
        .delete()
        .from(DeviceAuthSessions, 'd')
        .where('userId = :userId', { userId })
        .execute();

      await queryRunner.commitTransaction();

      return true;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (this.configService.get('ENV') === 'DEVELOPMENT') {
        this.logger.error(error);
      }
      return false;
    } finally {
      await queryRunner.release();
    }
  }
}
