import { join } from 'path';

export const serveStaticModuleConfig = {
  rootPath: join(__dirname, '..', 'swagger-static'),
  serveRoot: process.env.ENV === 'DEVELOPMENT' ? '/' : '/swagger',
};
