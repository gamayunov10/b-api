import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as process from 'process';

import { appEntities } from '../../../src/base/application/domain/app.entities';

export const testPostgresConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.TEST_POSTGRES_HOST,
  port: 5432,
  username: process.env.TEST_POSTGRES_USER,
  password: process.env.TEST_POSTGRES_PASSWORD,
  database: process.env.TEST_POSTGRES_DATABASE,
  autoLoadEntities: false,
  synchronize: false,
  logging: 'all',
  logger: 'debug',
  entities: [...appEntities],
  ssl: true,
  extra: {
    ssl: {
      rejectUnauthorized: false,
    },
  },
};
