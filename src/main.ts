import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';

import { AppModule } from './app.module';
import { APP_PREFIX, applyAppSettings } from './settings/apply-app-setting';
import { TelegramAdapter } from './features/integrations/telegram/adapters/telegram.adapter';
import { envConfig } from './settings/env.config';

const PORT = envConfig.PORT || 5000;

const hookUrl = envConfig.NGROK.URL;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger();

  applyAppSettings(app);

  await app.listen(PORT, () => {
    if (envConfig.ENV === 'DEVELOPMENT') {
      logger.log(`http://localhost:${PORT}${APP_PREFIX}`, envConfig.ENV);
    }
  });

  const telegramAdapter = await app.resolve(TelegramAdapter);

  await telegramAdapter.setWebhook(hookUrl + 'integrations/telegram/webhook');
}

bootstrap();
