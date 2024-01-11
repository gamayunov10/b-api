import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as process from 'process';

export const postgresConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.POSTGRES_HOST,
  port: 5432,
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DATABASE,
  autoLoadEntities: false,
  synchronize: false,

  ssl: true,
  extra: {
    ssl: {
      rejectUnauthorized: false,
    },
  },
};
