import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';

import { TypeOrmEntity } from '../typeorm/typeorm-entity';

@Injectable()
export class TransactionsRepository {
  async save(
    entity: TypeOrmEntity,
    manager: EntityManager,
  ): Promise<TypeOrmEntity> {
    return manager.save(entity);
  }
}
