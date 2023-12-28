import { Controller, Delete, HttpCode, Param, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CommandBus } from '@nestjs/cqrs';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtRefreshGuard } from 'src/features/auth/guards/jwt-refresh.guard';
import { UserIdFromGuard } from 'src/features/auth/decorators/user-id-from-guard.guard.decorator';
import { RefreshToken } from 'src/features/auth/decorators/refresh-token.param.decorator';
import { ResultCode } from 'src/base/enums/result-code.enum';
import { exceptionHandler } from 'src/infrastructure/exception-filters/exception.handler';

import { TerminateOtherSessionsCommand } from '../application/usecases/terminate-other-sessions.usecase';
import { TerminateSessionCommand } from '../application/usecases/terminate-session.usecase';

@ApiTags('security')
@Controller('security')
export class DevicesController {
  constructor(
    private commandBus: CommandBus,
    private readonly jwtService: JwtService,
  ) {}

  @Delete('devices')
  @ApiOperation({
    summary: 'Terminate all other (exclude current) devices sessions',
  })
  @UseGuards(JwtRefreshGuard)
  @HttpCode(204)
  async deleteOldDevices(@RefreshToken() refreshToken) {
    const decodedToken: any = this.jwtService.decode(refreshToken);
    const deviceId = decodedToken?.deviceId;
    const userId = decodedToken?.userId;
    return this.commandBus.execute(
      new TerminateOtherSessionsCommand(deviceId, userId),
    );
  }

  @Delete('devices/:id')
  @ApiOperation({
    summary: 'Terminate specified device session',
  })
  @UseGuards(JwtRefreshGuard)
  @HttpCode(204)
  async terminateSession(
    @Param('id') deviceId: string,
    @UserIdFromGuard() userId: string,
  ) {
    const result = await this.commandBus.execute(
      new TerminateSessionCommand(deviceId, userId),
    );

    if (result.code !== ResultCode.Success) {
      return exceptionHandler(result.code, result.message, result.field);
    }

    return result;
  }
}
