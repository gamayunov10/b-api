import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiTags } from '@nestjs/swagger';

import { UserCreateCommand } from '../application/usecases/create-user.usecase';
import { UserDeleteCommand } from '../application/usecases/delete-user.usecase';
import { UsersQueryRepository } from '../infrastructure/users.query.repository';
import { BasicAuthGuard } from '../../auth/guards/basic-auth.guard';
import { exceptionHandler } from '../../../infrastructure/exception-filters/exception.handler';
import { ResultCode } from '../../../base/enums/result-code.enum';
import { userIdField, userNotFound } from '../../../base/constants/constants';
import { SwaggerOptions } from '../../../infrastructure/decorators/swagger';
import { ErrorsMessages } from '../../../base/schemas/api-errors-messages.schema';
import { UserBanCommand } from '../application/usecases/ban-user.usecase';

import { UserInputModel } from './models/input/user-input-model';
import { UserQueryModel } from './models/input/user.query.model';
import { SuperAdminUserViewModel } from './models/output/sa-user-view.model';
import { UserBanInputModel } from './models/input/user-ban.input.model';

@ApiTags('sa/users')
@Controller('sa/users')
export class SAUsersController {
  constructor(
    private commandBus: CommandBus,
    private readonly usersQueryRepository: UsersQueryRepository,
  ) {}

  @Get()
  @SwaggerOptions(
    'Returns all users. Admins only',
    false,
    true,
    200,
    'Success',
    false,
    false,
    false,
    true,
    false,
    false,
    false,
  )
  @UseGuards(BasicAuthGuard)
  async findUsers(@Query() query: UserQueryModel) {
    return this.usersQueryRepository.findUsers(query);
  }

  @Post()
  @SwaggerOptions(
    'Add new user to the system. Admins only',
    false,
    true,
    201,
    'Returns the newly created user',
    SuperAdminUserViewModel,
    true,
    ErrorsMessages,
    true,
    false,
    false,
    false,
  )
  @UseGuards(BasicAuthGuard)
  async createUser(@Body() userInputModel: UserInputModel) {
    const userId = await this.commandBus.execute(
      new UserCreateCommand(userInputModel),
    );

    return this.usersQueryRepository.findUserById(userId);
  }

  @Put(':id/ban')
  @SwaggerOptions(
    'Ban/unban user',
    false,
    true,
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
  @UseGuards(BasicAuthGuard)
  @HttpCode(204)
  async ban(
    @Param('id') userId: string,
    @Body() userBanInputModel: UserBanInputModel,
  ) {
    const result = await this.commandBus.execute(
      new UserBanCommand(userBanInputModel, userId),
    );

    if (!result) {
      return exceptionHandler(ResultCode.NotFound, userNotFound, userIdField);
    }

    return result;
  }

  @Delete(':id')
  @SwaggerOptions(
    'Delete user specified by id. Admins only',
    false,
    true,
    204,
    'No Content',
    false,
    false,
    false,
    true,
    false,
    'If specified user is not exists',
    false,
  )
  @UseGuards(BasicAuthGuard)
  @HttpCode(204)
  async deleteUser(@Param('id') userId: string) {
    const result = await this.commandBus.execute(new UserDeleteCommand(userId));

    if (!result) {
      return exceptionHandler(ResultCode.NotFound, userNotFound, userIdField);
    }

    return result;
  }
}
