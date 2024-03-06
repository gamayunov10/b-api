import { NestFactory } from '@nestjs/core';
import * as process from 'process';
import * as ngrok from 'ngrok';

import { AppModule } from './app.module';
import { APP_PREFIX, applyAppSettings } from './settings/apply-app-setting';
import { TelegramAdapter } from './features/integrations/telegram/adapters/telegram.adapter';

const PORT = parseInt(process.env.PORT, 10) || 5000;

let hookUrl = process.env.APP_BASE_URL;
async function connectToNgrok() {
  return ngrok.connect(5000);
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  applyAppSettings(app);

  await app.listen(PORT, () => {
    console.log(`http://localhost:${PORT}${APP_PREFIX}`, process.env.ENV);
  });

  const telegramAdapter = await app.resolve(TelegramAdapter);

  if (process.env.NODE_ENV === 'development') {
    hookUrl = await connectToNgrok();
  }

  await telegramAdapter.setWebhook(hookUrl + 'integrations/telegram/webhook');
}

bootstrap();
