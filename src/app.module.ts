import { ConfigModule } from '@nestjs/config'
export const configModule_ENV = ConfigModule.forRoot({
  envFilePath: ['.env.local', '.env'],
})
import { Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { TypeOrmModule } from '@nestjs/typeorm'
import { postgresConfig } from './settings/postgres.config'

@Module({
  imports: [
    configModule_ENV,
    CqrsModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot(postgresConfig),
  ],
  providers: [],
  controllers: [],
})
export class AppModule {}
