import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
export const configModule_ENV = ConfigModule.forRoot({
  envFilePath: ['.env.local', '.env'],
});

import { postgresConfig } from './settings/postgres.config';
import { MailModule } from './features/mail/mail.module';
import { MainModule } from './base/modules/main.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { serveStaticModuleConfig } from './settings/serve-static-module.config';

@Module({
  imports: [
    configModule_ENV,
    TypeOrmModule.forRoot(postgresConfig),
    ServeStaticModule.forRoot(serveStaticModuleConfig),
    CqrsModule,
    MainModule,
    MailModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
