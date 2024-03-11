import { TypeOrmModuleOptions } from '@nestjs/typeorm';

import { appEntities } from '../base/application/domain/app.entities';

import { envConfig } from './env.config';

export const postgresConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: envConfig.DB.POSTGRES.HOST,
  port: 5432,
  username: envConfig.DB.POSTGRES.USER,
  password: envConfig.DB.POSTGRES.PASSWORD,
  database: envConfig.DB.POSTGRES.DATABASE_NAME,
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
