import {
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  UseGuards,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CommandBus } from '@nestjs/cqrs';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { TerminateOtherSessionsCommand } from '../application/usecases/terminate-other-sessions.usecase';
import { TerminateSessionCommand } from '../application/usecases/terminate-session.usecase';
import { DevicesQueryRepository } from '../infrastructure/devices.query.repository';
import { JwtRefreshGuard } from '../../auth/guards/jwt-refresh.guard';
import { RefreshToken } from '../../auth/decorators/refresh-token.param.decorator';
import { UserIdFromGuard } from '../../auth/decorators/user-id-from-guard.guard.decorator';
import { ResultCode } from '../../../base/enums/result-code.enum';
import { exceptionHandler } from '../../../infrastructure/exception-filters/exception.handler';

import { DeviceViewModel } from './models/output/device.view.model';

@ApiTags('device sessions')
@Controller('security')
export class DevicesController {
  constructor(
    private commandBus: CommandBus,
    private readonly jwtService: JwtService,
    private readonly devicesQueryRepository: DevicesQueryRepository,
  ) {}
  @Get('devices')
  @ApiOperation({
    summary: 'Terminate all other (exclude current) devices sessions',
  })
  @UseGuards(JwtRefreshGuard)
  async findActiveDevices(
    @RefreshToken() refreshToken: string,
  ): Promise<DeviceViewModel[]> {
    const decodedToken: any = this.jwtService.decode(refreshToken);

    const userId = decodedToken?.userId;

    return await this.devicesQueryRepository.findActiveDevices(userId);
  }

  @Delete('devices')
  @ApiOperation({
    summary: 'Terminate all other (exclude current) devices sessions',
  })
  @UseGuards(JwtRefreshGuard)
  @HttpCode(204)
  async deleteOldDevices(@RefreshToken() refreshToken: string) {
    const decodedToken: any = this.jwtService.decode(refreshToken);

    return this.commandBus.execute(
      new TerminateOtherSessionsCommand(
        decodedToken?.deviceId,
        decodedToken?.userId,
      ),
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
