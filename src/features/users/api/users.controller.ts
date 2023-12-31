import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiBasicAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { UserCreateCommand } from '../application/usecases/create-user.usecase';
import { UserDeleteCommand } from '../application/usecases/delete-user.usecase';
import { UsersQueryRepository } from '../infrastructure/users.query.repository';
import { BasicAuthGuard } from '../../auth/guards/basic-auth.guard';
import { exceptionHandler } from '../../../infrastructure/exception-filters/exception.handler';
import { ResultCode } from '../../../base/enums/result-code.enum';
import { userIDField, userNotFound } from '../../../base/constants/constants';

import { UserInputModel } from './models/input/user-input-model';
import { UserQueryModel } from './models/input/user.query.model';

@ApiTags('sa/users')
@Controller('sa/users')
export class UsersController {
  constructor(
    private commandBus: CommandBus,
    private readonly usersQueryRepository: UsersQueryRepository,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Returns all users. Admins only',
  })
  @ApiBasicAuth('Basic')
  @UseGuards(BasicAuthGuard)
  async findUsers(@Query() query: UserQueryModel) {
    return this.usersQueryRepository.findUsers(query);
  }

  @Post()
  @ApiOperation({
    summary: 'Add new user to the system. Admins only',
  })
  @ApiBasicAuth('Basic')
  @UseGuards(BasicAuthGuard)
  async createUser(@Body() userInputModel: UserInputModel) {
    const userId = await this.commandBus.execute(
      new UserCreateCommand(userInputModel),
    );

    return this.usersQueryRepository.findUserById(userId);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete user specified by id. Admins only',
  })
  @ApiBasicAuth('Basic')
  @UseGuards(BasicAuthGuard)
  @HttpCode(204)
  async deleteUser(@Param('id') userId: number) {
    const result = await this.commandBus.execute(new UserDeleteCommand(userId));

    if (!result) {
      return exceptionHandler(ResultCode.NotFound, userNotFound, userIDField);
    }

    return result;
  }
}
