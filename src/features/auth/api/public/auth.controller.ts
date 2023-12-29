import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  Ip,
  Post,
  Response,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { CommandBus } from '@nestjs/cqrs';
import { ApiBasicAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UsersRepository } from 'src/features/users/infrastructure/users.repository';
import { UserInputModel } from 'src/features/users/api/models/input/user-input-model';
import { TerminateSessionCommand } from 'src/features/devices/application/usecases/terminate-session.usecase';
import { UpdateTokensCommand } from 'src/features/devices/application/usecases/update-tokens.usecase';
import { Response as ExpressResponse } from 'express';

import { ResultCode } from '../../../../base/enums/result-code.enum';
import {
  confirmCodeField,
  confirmCodeIsIncorrect,
  emailField,
  recoveryCodeField,
  recoveryCodeIsIncorrect,
  userIDField,
  userNotFound,
  userNotFoundOrConfirmed,
} from '../../../../base/constants/constants';
import { ConfirmationCodeInputModel } from '../../models/user-confirm.model';
import { UserIdFromGuard } from '../../decorators/user-id-from-guard.guard.decorator';
import { JwtRefreshGuard } from '../../guards/jwt-refresh.guard';
import { RefreshToken } from '../../decorators/refresh-token.param.decorator';
import { JwtBearerGuard } from '../../guards/jwt-bearer.guard';
import { EmailInputModel } from '../../models/email-input.model';
import { NewPasswordModel } from '../../models/new-password.model';
import { exceptionHandler } from '../../../../infrastructure/exception-filters/exception.handler';
import { LoginDeviceCommand } from '../../../devices/application/usecases/login-device.usecase';
import { LoginInputModel } from '../../models/login-input.model';

import { TokensCreateCommand } from './application/usecases/tokens/tokens-create.usecase';
import { PasswordUpdateCommand } from './application/usecases/password/password-update.usecase';
import { PasswordRecoveryCommand } from './application/usecases/password/password-recovery.usecase';
import { RegistrationEmailResendCommand } from './application/usecases/registration/registration-email-resend.usecase';
import { RegistrationCommand } from './application/usecases/registration/registration.usecase';
import { RegistrationConfirmationCommand } from './application/usecases/registration/registration-confirmation.usecase';
import { AuthService } from './application/auth.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private commandBus: CommandBus,
    private readonly jwtService: JwtService,
    private readonly usersRepository: UsersRepository,
    private readonly authService: AuthService,
  ) {}

  @Get('me')
  @UseGuards(JwtBearerGuard)
  @ApiOperation({ summary: 'Get information about current user' })
  @ApiBasicAuth('Bearer')
  async getProfile(@UserIdFromGuard() userId: number) {
    const user = await this.usersRepository.findUserById(userId);

    if (!user) {
      return exceptionHandler(ResultCode.NotFound, userNotFound, userIDField);
    }

    return {
      email: user?.email,
      login: user?.login,
      userId,
    };
  }

  @Post('registration')
  @ApiOperation({
    summary:
      'Registration in the system. Email with confirmation code will be send to passed email address',
  })
  @UseGuards(ThrottlerGuard)
  @Throttle(5, 10)
  @HttpCode(204)
  async registerUser(@Body() userInputModel: UserInputModel) {
    return this.commandBus.execute(new RegistrationCommand(userInputModel));
  }

  @Post('registration-confirmation')
  @ApiOperation({ summary: 'Confirm registration' })
  @UseGuards(ThrottlerGuard)
  @Throttle(5, 10)
  @HttpCode(204)
  async confirmUser(@Body() confirmCodeInputModel: ConfirmationCodeInputModel) {
    const result = await this.commandBus.execute(
      new RegistrationConfirmationCommand(confirmCodeInputModel),
    );

    if (!result) {
      return exceptionHandler(
        ResultCode.BadRequest,
        confirmCodeIsIncorrect,
        confirmCodeField,
      );
    }

    return result;
  }

  @Post('registration-email-resending')
  @ApiOperation({
    summary: 'Resend confirmation registration Email if user exists',
  })
  @UseGuards(ThrottlerGuard)
  @Throttle(5, 10)
  @HttpCode(204)
  async resendEmail(@Body() emailInputModel: EmailInputModel) {
    const result = await this.commandBus.execute(
      new RegistrationEmailResendCommand(emailInputModel),
    );

    if (!result) {
      return exceptionHandler(
        ResultCode.BadRequest,
        userNotFoundOrConfirmed,
        emailField,
      );
    }

    return result;
  }

  @Post('password-recovery')
  @ApiOperation({
    summary:
      'Password recovery via Email confirmation. Email should be sent with RecoveryCode inside',
  })
  @UseGuards(ThrottlerGuard)
  @Throttle(5, 10)
  @HttpCode(204)
  async recoverPassword(@Body() emailInputModel: EmailInputModel) {
    return this.commandBus.execute(
      new PasswordRecoveryCommand(emailInputModel),
    );
  }

  @Post('new-password')
  @ApiOperation({
    summary: 'Confirm Password recovery',
  })
  @UseGuards(ThrottlerGuard)
  @Throttle(5, 10)
  @HttpCode(204)
  async updatePassword(@Body() newPasswordModel: NewPasswordModel) {
    const result = await this.commandBus.execute(
      new PasswordUpdateCommand(newPasswordModel),
    );

    if (!result) {
      return exceptionHandler(
        ResultCode.BadRequest,
        recoveryCodeIsIncorrect,
        recoveryCodeField,
      );
    }

    return result;
  }

  @Post('refresh-token')
  @ApiOperation({
    summary:
      'Generate new pair of access and refresh tokens (in cookie client must send correct refreshToken that will be revoked after refreshing) Device LastActiveDate should be overrode by issued Date of new refresh token',
  })
  @UseGuards(JwtRefreshGuard)
  @HttpCode(200)
  async refreshTokens(
    @UserIdFromGuard() userId: string,
    @Ip() ip: string,
    @Headers() headers: string,
    @RefreshToken() refreshToken: string,
    @Response() res: ExpressResponse,
  ): Promise<void> {
    const userAgent = headers['user-agent'] || 'unknown';

    const decodedToken: any = this.jwtService.decode(refreshToken);

    const tokens = await this.commandBus.execute(
      new TokensCreateCommand(userId, decodedToken.deviceId),
    );

    const newToken = this.jwtService.decode(tokens.refreshToken);

    await this.commandBus.execute(
      new UpdateTokensCommand(newToken, ip, userAgent),
    );

    res
      .cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: true,
      })
      .json({ accessToken: tokens.accessToken });
  }

  @Post('login')
  @ApiOperation({
    summary: 'Try login user to the system',
  })
  @UseGuards(ThrottlerGuard)
  @Throttle(5, 10)
  @HttpCode(200)
  async login(
    @Ip() ip: string,
    @Body() body: LoginInputModel,
    @Headers() headers: string,
    @Response() res: ExpressResponse,
  ) {
    const userId = await this.authService.checkCredentials(
      body.loginOrEmail,
      body.password,
    );

    if (!userId) {
      throw new UnauthorizedException();
    }

    const userAgent = headers['user-agent'] || 'unknown';

    const tokens = await this.commandBus.execute(
      new TokensCreateCommand(userId),
    );

    await this.commandBus.execute(
      new LoginDeviceCommand(tokens.refreshToken, ip, userAgent),
    );

    res
      .cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: true,
      })
      .json({ accessToken: tokens.accessToken });
  }

  @Post('logout')
  @ApiOperation({
    summary:
      'In cookie client must send correct refreshToken that will be revoked',
  })
  @UseGuards(JwtRefreshGuard)
  @HttpCode(204)
  async logout(@RefreshToken() refreshToken: string): Promise<boolean> {
    const decodedToken: any = this.jwtService.decode(refreshToken);

    return this.commandBus.execute(
      new TerminateSessionCommand(decodedToken.deviceId, decodedToken.userId),
    );
  }
}
