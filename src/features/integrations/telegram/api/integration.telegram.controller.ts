import {
  Body,
  Controller,
  Get,
  HttpCode,
  Logger,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ConfigService } from '@nestjs/config';

import { SwaggerOptions } from '../../../../infrastructure/decorators/swagger';
import { JwtBearerGuard } from '../../../auth/guards/jwt-bearer.guard';
import { UserIdFromGuard } from '../../../auth/decorators/user-id-from-guard.guard.decorator';
import { exceptionHandler } from '../../../../infrastructure/exception-filters/exception.handler';
import { ResultCode } from '../../../../base/enums/result-code.enum';
import { TgAddToNotificationsCommand } from '../application/usecases/tg-add-to-notifications.usecase';
import { TgBotGetAuthLinkQuery } from '../application/usecases/tg-bot-get-auth-link-query.usecase';

import { GetMyTgAuthLinkViewModel } from './models/output/get-my-tg-auth-link-view.model';

@Controller('integrations/telegram')
export class IntegrationTelegramController {
  private readonly logger = new Logger(IntegrationTelegramController.name);
  private readonly configService = new ConfigService();
  constructor(private commandBus: CommandBus, private queryBus: QueryBus) {}

  @Get('auth-bot-link')
  @SwaggerOptions(
    'Get auth bot link with personal user code inside',
    true,
    false,
    200,
    'Success',
    GetMyTgAuthLinkViewModel,
    false,
    false,
    true,
    false,
    false,
    false,
  )
  @UseGuards(JwtBearerGuard)
  async getBotLink(@UserIdFromGuard() userId: string) {
    const result = await this.queryBus.execute(
      new TgBotGetAuthLinkQuery(userId),
    );

    if (!result.link && result.code !== ResultCode.Success) {
      return exceptionHandler(result.code, result.message, result.field);
    }

    return result;
  }

  @Post('webhook')
  @SwaggerOptions(
    'Webhook for TelegramBot Api (see telegram bot official documentation)',
    false,
    false,
    204,
    'No Content',
    false,
    false,
    false,
    false,
    false,
    false,
    false,
  )
  @HttpCode(204)
  async setWebHook(@Body() payload: any) {
    // if (this.configService.get('ENV') === 'DEVELOPMENT') {
    //   this.logger.log(payload, 'payload');
    // }

    if (!payload.message) {
      return;
    }

    if (payload.message.text.includes('/start')) {
      return this.commandBus.execute(
        new TgAddToNotificationsCommand(
          payload.message.from.id,
          payload.message.text,
        ),
      );
    }

    return;
  }
}
