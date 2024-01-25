import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as process from 'process';

export const postgresConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.POSTGRES_HOST,
  port: 5432,
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DATABASE,
  autoLoadEntities: true,
  synchronize: false,
  logging: 'all',
  logger: 'debug',
  entities: ['src/**/*/.entity{.ts, .js}'],

  // ssl: true,
  // extra: {
  //   ssl: {
  //     rejectUnauthorized: false,
  //   },
  // },
};
