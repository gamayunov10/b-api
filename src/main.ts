import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import process from 'process';

import { AppModule } from './app.module';
import { APP_PREFIX, applyAppSettings } from './settings/apply-app-setting';
import { TelegramAdapter } from './features/integrations/telegram/adapters/telegram.adapter';

const PORT = process.env.PORT || 5000;

const hookUrl = process.env.APP_BASE_URL;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger();

  applyAppSettings(app);

  await app.listen(PORT, () => {
    if (process.env.ENV === 'DEVELOPMENT') {
      logger.log(`http://localhost:${PORT}${APP_PREFIX}`, process.env.ENV);
    }
  });

  const telegramAdapter = await app.resolve(TelegramAdapter);

  await telegramAdapter.setWebhook(hookUrl + 'integrations/telegram/webhook');
}

bootstrap();
