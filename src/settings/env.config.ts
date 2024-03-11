import { ConfigService } from '@nestjs/config';

const configService = new ConfigService();

export const envConfig = {
  ENV: configService.get('ENV'),
  PORT: configService.get('PORT'),
  JWT: {
    ACCESS_SECRET: configService.get('JWT_ACCESS_SECRET'),
    REFRESH_SECRET: configService.get('JWT_REFRESH_SECRET'),
    ACCESS_EXP_TIME: configService.get('JWT_ACCESS_EXPIRATION_TIME'),
    REFRESH_EXP_TIME: configService.get('JWT_REFRESH_EXPIRATION_TIME'),
  },
  COMPANY_EMAIL: {
    EMAIL: configService.get('EMAIL'),
    PASSWD: configService.get('EMAIL_PASS'),
  },
  S3: {
    ACCESS_KEY_ID: configService.get('S3_ACCESS_KEY_ID'),
    SECRET_ACCESS_KEY: configService.get('S3_SECRET_ACCESS_KEY'),
    BUCKET_NAME: configService.get('BUCKET_NAME'),
    DOMAIN: configService.get('S3_DOMAIN'),
    BUCKET_NAME_PLUS_DOMAIN: configService.get('S3_BUCKET_NAME_PLUS_S3_DOMAIN'),
  },
  TELEGRAM: {
    BOT_TOKEN: configService.get('TELEGRAM_BOT_TOKEN'),
    ID: configService.get('TELEGRAM_ID'),
    USERNAME: configService.get('TELEGRAM_USERNAME'),
  },
  NGROK: {
    URL: configService.get('APP_BASE_URL'),
    AUTH_TOKEN: configService.get('NGROK_AUTH_TOKEN'),
  },
  PAYMENT: {
    STRIPE: {
      SECRET_KEY: configService.get('STRIPE_SECRET_KEY'),
      SIGNING_SECRET: configService.get('STRIPE_SIGNING_SECRET'),
    },
  },
  DB: {
    POSTGRES: {
      HOST: configService.get('POSTGRES_HOST'),
      USER: configService.get('POSTGRES_USER'),
      PASSWORD: configService.get('POSTGRES_PASSWORD'),
      DATABASE_NAME: configService.get('POSTGRES_DATABASE'),
    },
    POSTGRES_TEST: {
      HOST: configService.get('TEST_POSTGRES_HOST'),
      USER: configService.get('TEST_POSTGRES_USER'),
      PASSWORD: configService.get('TEST_POSTGRES_PASSWORD'),
      DATABASE_NAME: configService.get('TEST_POSTGRES_DATABASE'),
    },
  },
};
