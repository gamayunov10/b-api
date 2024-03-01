import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EntityManager } from 'typeorm';

@Injectable()
export class TransactionHelper {
  private readonly logger = new Logger(TransactionHelper.name);
  private configService: ConfigService;
  private entityManager: EntityManager;

  constructor(configService: ConfigService, entityManager: EntityManager) {
    this.configService = configService;
    this.entityManager = entityManager;
  }

  async executeInTransaction(
    callback: (entityManager: EntityManager) => Promise<any>,
  ): Promise<any> {
    const queryRunner = this.entityManager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const result = await callback(this.entityManager);

      await queryRunner.commitTransaction();

      return result;
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
