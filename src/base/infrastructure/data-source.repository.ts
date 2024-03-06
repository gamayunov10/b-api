import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { TypeOrmEntity } from '../typeorm/typeorm-entity';

@Injectable()
export class DataSourceRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}
  async save(entity: TypeOrmEntity): Promise<TypeOrmEntity> {
    return this.dataSource.manager.save(entity);
  }
}
