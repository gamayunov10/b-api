import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { useContainer } from 'class-validator';
import { customExceptionFactory } from 'src/infrastructure/exception-filters/exception.factory';
import * as process from 'process';
import { createWriteStream } from 'fs';
import { get } from 'https';

import { HttpExceptionFilter } from '../infrastructure/exception-filters/http-exception-filter';
import { AppModule } from '../app.module';

export const APP_PREFIX = '';

export const applyAppSettings = (app: INestApplication) => {
  app.enableCors();
  app.useGlobalFilters(new HttpExceptionFilter());

  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  setAppPrefix(app);

  setSwagger(app);

  setAppPipes(app);

  setAppExceptionsFilters(app);
};

const setAppPrefix = (app: INestApplication) => {
  app.setGlobalPrefix(APP_PREFIX);
};

const setSwagger = (app: INestApplication) => {
  if (process.env.ENV !== 'PRODUCTION') {
    get(
      `${process.env.SERVER_URL}/swagger/swagger-ui-bundle.js`,
      function (response) {
        response.pipe(createWriteStream('swagger-static/swagger-ui-bundle.js'));
        console.log(
          `Swagger UI bundle file written to: '/swagger-static/swagger-ui-bundle.js'`,
        );
      },
    );

    get(
      `${process.env.SERVER_URL}/swagger/swagger-ui-init.js`,
      function (response) {
        response.pipe(createWriteStream('swagger-static/swagger-ui-init.js'));
        console.log(
          `Swagger UI init file written to: '/swagger-static/swagger-ui-init.js'`,
        );
      },
    );

    get(
      `${process.env.SERVER_URL}/swagger/swagger-ui-standalone-preset.js`,
      function (response) {
        response.pipe(
          createWriteStream('swagger-static/swagger-ui-standalone-preset.js'),
        );
        console.log(
          `Swagger UI standalone preset file written to: '/swagger-static/swagger-ui-standalone-preset.js'`,
        );
      },
    );

    get(
      `${process.env.SERVER_URL}/swagger/swagger-ui.css`,
      function (response) {
        response.pipe(createWriteStream('swagger-static/swagger-ui.css'));
        console.log(
          `Swagger UI css file written to: '/swagger-static/swagger-ui.css'`,
        );
      },
    );

    const swaggerPath = APP_PREFIX + '/swagger';

    const config = new DocumentBuilder()
      .setTitle('BLOGGER API')
      .addBearerAuth()
      .setVersion('1.0')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup(swaggerPath, app, document, {
      customSiteTitle: 'Blogger Swagger',
    });
  }
};

const setAppPipes = (app: INestApplication) => {
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      stopAtFirstError: true,
      exceptionFactory: customExceptionFactory,
    }),
  );
};

const setAppExceptionsFilters = (app: INestApplication) => {
  app.useGlobalFilters(new HttpExceptionFilter());
};
