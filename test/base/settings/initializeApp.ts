import { Test } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { useContainer } from 'class-validator';
import cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import supertest from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';

import { customExceptionFactory } from '../../../src/infrastructure/exception-filters/exception.factory';
import { AppModule } from '../../../src/app.module';
import { HttpExceptionFilter } from '../../../src/infrastructure/exception-filters/http-exception-filter';
import { postgresConfig } from '../../../src/settings/postgres.config';
import { testing_allData_uri } from '../utils/constants/routes';

export const initializeApp = async () => {
  const moduleRef = await Test.createTestingModule({
    imports: [
      ConfigModule.forRoot(),
      TypeOrmModule.forRoot(postgresConfig),
      AppModule,
    ],
  }).compile();

  const app = moduleRef.createNestApplication();

  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  app.enableCors();
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      stopAtFirstError: true,
      exceptionFactory: customExceptionFactory,
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());

  await app.init();
  const agent = supertest.agent(app.getHttpServer());

  await agent.delete(testing_allData_uri);

  return { app, agent };
};
