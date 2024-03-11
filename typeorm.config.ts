import { config } from 'dotenv';
import { DataSource } from 'typeorm';

import { envConfig } from './src/settings/env.config';
import { appEntities } from './src/base/application/domain/app.entities';

config();

export default new DataSource({
  type: 'postgres',
  host: envConfig.DB.POSTGRES.HOST,
  port: 5432,
  username: envConfig.DB.POSTGRES.USER,
  password: envConfig.DB.POSTGRES.PASSWORD,
  database: envConfig.DB.POSTGRES.DATABASE_NAME,
  migrations: ['migrations/*.ts'],
  entities: [...appEntities],
});
