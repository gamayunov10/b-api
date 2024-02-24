import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags } from '@nestjs/swagger';

import { exceptionHandler } from '../../../infrastructure/exception-filters/exception.handler';
import { ResultCode } from '../../../base/enums/result-code.enum';
import { SwaggerOptions } from '../../../infrastructure/decorators/swagger';
import { ErrorsMessages } from '../../../base/schemas/api-errors-messages.schema';
import { JwtBearerGuard } from '../../auth/guards/jwt-bearer.guard';
import { UserIdFromGuard } from '../../auth/decorators/user-id-from-guard.guard.decorator';
import { UserBanByBloggerCommand } from '../application/usecases/ban-user-by-blogger.usecase';
import { BloggerGetBannedUsersQuery } from '../application/usecases/blogger-get-banned-users.usecase';
import { BloggerUsersSchema } from '../../../base/schemas/blogger-users-schema';

import { UserBanByBloggerInputModel } from './models/input/user-ban-by-blogger.input.model';
import { UserBloggerQueryModel } from './models/input/user-blogger.query.model';

@ApiTags('blogger/users')
@Controller('blogger/users')
export class BloggerUsersController {
  constructor(private commandBus: CommandBus, private queryBus: QueryBus) {}

  @Get('blog/:blogId')
  @SwaggerOptions(
    'Returns all banned users for blog',
    true,
    false,
    200,
    'Success',
    BloggerUsersSchema,
    false,
    false,
    true,
    false,
    false,
    false,
  )
  @UseGuards(JwtBearerGuard)
  async findBannedUsers(
    @Query() query: UserBloggerQueryModel,
    @Param('blogId') blogId: string,
    @UserIdFromGuard() userId: string,
  ) {
    const result = await this.queryBus.execute(
      new BloggerGetBannedUsersQuery(query, blogId, userId),
    );

    if (result.code !== ResultCode.Success) {
      return exceptionHandler(result.code, result.message, result.field);
    }

    return result.response;
  }

  @Put(':userId/ban')
  @SwaggerOptions(
    'Ban/unban user',
    true,
    false,
    204,
    'No Content',
    false,
    'If the inputModel has incorrect values',
    ErrorsMessages,
    true,
    false,
    false,
    false,
  )
  @UseGuards(JwtBearerGuard)
  @HttpCode(204)
  async ban(
    @Param('userId') userId: string,
    @Body() userBanByBloggerInputModel: UserBanByBloggerInputModel,
    @UserIdFromGuard('id') bloggerId: string,
  ) {
    const result = await this.commandBus.execute(
      new UserBanByBloggerCommand(
        userBanByBloggerInputModel,
        userId,
        bloggerId,
      ),
    );

    if (result.code !== ResultCode.Success) {
      return exceptionHandler(result.code, result.message, result.field);
    }

    return result;
  }
}
