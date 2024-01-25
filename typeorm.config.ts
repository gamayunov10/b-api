import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import process from 'process';

config();

export default new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST,
  port: 5432,
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DATABASE,
  synchronize: false,
  entities: ['src/**/*.entity.ts'],
  migrations: ['migrations/*.ts'],
});
