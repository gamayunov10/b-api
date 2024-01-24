import { DataSource } from 'typeorm';
import process from 'process';

export const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST,
  port: 5432,
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DATABASE,
  synchronize: false,
  migrations: [__dirname + '/migrations/**/*.{js, ts}'],
  entities: ['src/**/*/.entity.{ts, js}'],
  // ssl: true,
  // extra: {
  //   ssl: {
  //     rejectUnauthorized: false,
  //   },
  // },
});
// pnpm typeorm-ts-node-commonjs migration:generate ./src/db/migrations/add-user.entity -d ./src/db/data-source.ts
// pnpm typeorm-ts-node-commonjs migration:revert -d ./src/db/data-source.ts
// pnpm typeorm-ts-node-commonjs migration:run -d ./src/db/data-source.ts
