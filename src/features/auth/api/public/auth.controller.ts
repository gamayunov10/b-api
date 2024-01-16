import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  Ip,
  Post,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { CommandBus } from '@nestjs/cqrs';
import { ApiTags } from '@nestjs/swagger';
import { SkipThrottle, Throttle, ThrottlerGuard } from '@nestjs/throttler';

import { ResultCode } from '../../../../base/enums/result-code.enum';
import {
  confirmCodeField,
  confirmCodeIsIncorrect,
  emailField,
  recoveryCodeField,
  recoveryCodeIsIncorrect,
  userIdField,
  userNotFound,
  userNotFoundOrConfirmed,
} from '../../../../base/constants/constants';
import { ConfirmationCodeInputModel } from '../../models/input/user-confirm.model';
import { UserIdFromGuard } from '../../decorators/user-id-from-guard.guard.decorator';
import { JwtRefreshGuard } from '../../guards/jwt-refresh.guard';
import { RefreshToken } from '../../decorators/refresh-token.param.decorator';
import { JwtBearerGuard } from '../../guards/jwt-bearer.guard';
import { EmailInputModel } from '../../models/input/email-input.model';
import { NewPasswordModel } from '../../models/input/new-password.model';
import { exceptionHandler } from '../../../../infrastructure/exception-filters/exception.handler';
import { LoginDeviceCommand } from '../../../devices/application/usecases/login-device.usecase';
import { LoginInputModel } from '../../models/input/login-input.model';
import { UserInputModel } from '../../../users/api/models/input/user-input-model';
import { UpdateTokensCommand } from '../../../devices/application/usecases/update-tokens.usecase';
import { UsersQueryRepository } from '../../../users/infrastructure/users.query.repository';
import { MeView } from '../../models/output/me-view.model';
import { AccessTokenView } from '../../models/output/access-token-view.model';
import { ErrorsMessages } from '../../../../base/schemas/api-errors-messages.schema';
import { SwaggerOptions } from '../../../../infrastructure/decorators/swagger';

import { TokensCreateCommand } from './application/usecases/tokens/tokens-create.usecase';
import { PasswordUpdateCommand } from './application/usecases/password/password-update.usecase';
import { PasswordRecoveryCommand } from './application/usecases/password/password-recovery.usecase';
import { RegistrationEmailResendCommand } from './application/usecases/registration/registration-email-resend.usecase';
import { RegistrationCommand } from './application/usecases/registration/registration.usecase';
import { RegistrationConfirmationCommand } from './application/usecases/registration/registration-confirmation.usecase';
import { AuthService } from './application/auth.service';
import { TerminateSessionLogoutCommand } from './application/usecases/tokens/terminate-session-logout.usecase';

@ApiTags('auth')
@Controller('auth')
@UseGuards(ThrottlerGuard)
@Throttle(5, 10)
export class AuthController {
  constructor(
    private commandBus: CommandBus,
    private readonly jwtService: JwtService,
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly authService: AuthService,
  ) {}

  @Get('me')
  @SkipThrottle(true)
  @SwaggerOptions(
    'Get information about current user',
    true,
    false,
    200,
    'Success',
    MeView,
    false,
    false,
    true,
    false,
    false,
    false,
  )
  @UseGuards(JwtBearerGuard)
  async getProfile(@UserIdFromGuard() userId: number) {
    const user = await this.usersQueryRepository.findUserById(userId);

    if (!user) {
      return exceptionHandler(ResultCode.NotFound, userNotFound, userIdField);
    }

    return {
      email: user?.email,
      login: user?.login,
      userId,
    };
  }

  @Post('registration')
  @SwaggerOptions(
    'Registration in the system. Email with confirmation code will be send to passed email address',
    false,
    false,
    204,
    'Input data is accepted. Email with confirmation code will be send to passed email address',
    false,
    'If the inputModel has incorrect values (in particular if the user with the given email or password already exists)',
    ErrorsMessages,
    false,
    false,
    false,
    true,
  )
  @HttpCode(204)
  async registerUser(@Body() userInputModel: UserInputModel) {
    return this.commandBus.execute(new RegistrationCommand(userInputModel));
  }

  @Post('registration-confirmation')
  @SwaggerOptions(
    'Confirm registration',
    false,
    false,
    204,
    'Email was verified. Account was activated',
    false,
    'If the confirmation code is incorrect, expired or already been applied',
    ErrorsMessages,
    false,
    false,
    false,
    true,
  )
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
  @SwaggerOptions(
    'Resend confirmation registration Email if user exists',
    false,
    false,
    204,
    'Input data is accepted.Email with confirmation code will be send to passed email address.Confirmation code should be inside link as query param, for example: https://some-front.com/confirm-registration?code=youtcodehere',
    false,
    true,
    ErrorsMessages,
    false,
    false,
    false,
    true,
  )
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
  @SwaggerOptions(
    'Password recovery via Email confirmation. Email should be sent with RecoveryCode inside',
    false,
    false,
    204,
    "Even if current email is not registered (for prevent user's email detection)",
    false,
    true,
    false,
    false,
    false,
    false,
    true,
  )
  @HttpCode(204)
  async recoverPassword(@Body() emailInputModel: EmailInputModel) {
    return this.commandBus.execute(
      new PasswordRecoveryCommand(emailInputModel),
    );
  }

  @Post('new-password')
  @SwaggerOptions(
    'Confirm Password recovery',
    false,
    false,
    204,
    'If code is valid and new password is accepted',
    false,
    'If the inputModel has incorrect value (for incorrect password length) or RecoveryCode is incorrect or expired',
    false,
    false,
    false,
    false,
    true,
  )
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
  @SkipThrottle(true)
  @SwaggerOptions(
    'Generate new pair of access and refresh tokens (in cookie client must send correct refreshToken that will be revoked after refreshing) Device LastActiveDate should be overrode by issued Date of new refresh token',
    false,
    false,
    200,
    'Returns JWT accessToken (expired after 10 seconds) in body and JWT refreshToken in cookie (http-only, secure) (expired after 20 seconds).',
    AccessTokenView,
    'If the inputModel has incorrect value (for incorrect password length) or RecoveryCode is incorrect or expired',
    false,
    'If the JWT refreshToken inside cookie is missing, expired or incorrect',
    false,
    false,
    false,
  )
  @UseGuards(JwtRefreshGuard)
  @HttpCode(200)
  async refreshTokens(
    @UserIdFromGuard() userId: string,
    @Ip() ip: string,
    @Headers() headers: string,
    @RefreshToken() refreshToken: string,
    @Res() res: Response,
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

    (res as Response)
      .cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: true,
      })
      .json({ accessToken: tokens.accessToken });
  }

  @Post('login')
  @SwaggerOptions(
    'Try login user to the system',
    false,
    false,
    200,
    'Returns JWT accessToken (expired after 10 seconds) in body and JWT refreshToken in cookie (http-only, secure) (expired after 20 seconds).',
    AccessTokenView,
    'If the inputModel has incorrect value (for incorrect password length) or RecoveryCode is incorrect or expired',
    false,
    'If the password or login is wrong',
    false,
    false,
    true,
  )
  @HttpCode(200)
  async login(
    @Ip() ip: string,
    @Body() body: LoginInputModel,
    @Headers() headers: string,
    @Res() res: Response,
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

    (res as Response)
      .cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: true,
      })
      .json({ accessToken: tokens.accessToken });
  }

  @Post('logout')
  @SkipThrottle(true)
  @SwaggerOptions(
    'In cookie client must send correct refreshToken that will be revoked',
    false,
    false,
    204,
    'No Content',
    false,
    'If the inputModel has incorrect value (for incorrect password length) or RecoveryCode is incorrect or expired',
    false,
    'If the JWT refreshToken inside cookie is missing, expired or incorrect',
    false,
    false,
    false,
  )
  @UseGuards(JwtRefreshGuard)
  @HttpCode(204)
  async logout(@RefreshToken() refreshToken: string): Promise<boolean> {
    const decodedToken: any = this.jwtService.decode(refreshToken);

    return this.commandBus.execute(
      new TerminateSessionLogoutCommand(decodedToken.deviceId),
    );
  }
}
