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
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiExtraModels,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
  getSchemaPath,
} from '@nestjs/swagger';
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
  @ApiOperation({ summary: 'Get information about current user' })
  @ApiBearerAuth()
  @ApiExtraModels(MeView)
  @ApiResponse({
    status: 200,
    description: 'Success',
    schema: {
      $ref: getSchemaPath(MeView),
    },
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
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
  @ApiOperation({
    summary:
      'Registration in the system. Email with confirmation code will be send to passed email address',
  })
  @ApiNoContentResponse({
    description:
      'Input data is accepted. Email with confirmation code will be send to passed email address',
  })
  @ApiExtraModels(ErrorsMessages)
  @ApiBadRequestResponse({
    description:
      'If the inputModel has incorrect values (in particular if the user with the given email or password already exists)',
    schema: {
      $ref: getSchemaPath(ErrorsMessages),
    },
  })
  @ApiTooManyRequestsResponse({
    description: 'More than 5 attempts from one IP-address during 10 seconds',
  })
  @HttpCode(204)
  async registerUser(@Body() userInputModel: UserInputModel) {
    return this.commandBus.execute(new RegistrationCommand(userInputModel));
  }

  @Post('registration-confirmation')
  @ApiOperation({ summary: 'Confirm registration' })
  @ApiNoContentResponse({
    description: 'Email was verified. Account was activated',
  })
  @ApiExtraModels(ErrorsMessages)
  @ApiBadRequestResponse({
    description:
      'If the confirmation code is incorrect, expired or already been applied',
    schema: {
      $ref: getSchemaPath(ErrorsMessages),
    },
  })
  @ApiTooManyRequestsResponse({
    description: 'More than 5 attempts from one IP-address during 10 seconds',
  })
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
  @ApiNoContentResponse({
    description:
      'Input data is accepted.Email with confirmation code will be send to passed email address.Confirmation code should be inside link as query param, for example: https://some-front.com/confirm-registration?code=youtcodehere',
  })
  @ApiExtraModels(ErrorsMessages)
  @ApiBadRequestResponse({
    description: 'If the inputModel has incorrect values',
    schema: {
      $ref: getSchemaPath(ErrorsMessages),
    },
  })
  @ApiTooManyRequestsResponse({
    description: 'More than 5 attempts from one IP-address during 10 seconds',
  })
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
  @ApiNoContentResponse({
    description:
      "Even if current email is not registered (for prevent user's email detection)",
  })
  @ApiBadRequestResponse({
    description: 'if the inputModel has incorrect values',
  })
  @ApiTooManyRequestsResponse({
    description: 'More than 5 attempts from one IP-address during 10 seconds',
  })
  @HttpCode(204)
  async recoverPassword(@Body() emailInputModel: EmailInputModel) {
    return this.commandBus.execute(
      new PasswordRecoveryCommand(emailInputModel),
    );
  }

  @Post('new-password')
  @ApiOperation({ summary: 'Confirm Password recovery' })
  @ApiNoContentResponse({
    description: 'If code is valid and new password is accepted',
  })
  @ApiBadRequestResponse({
    description:
      'If the inputModel has incorrect value (for incorrect password length) or RecoveryCode is incorrect or expired',
  })
  @ApiTooManyRequestsResponse({
    description: 'More than 5 attempts from one IP-address during 10 seconds',
  })
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
  @ApiOperation({
    summary:
      'Generate new pair of access and refresh tokens (in cookie client must send correct refreshToken that will be revoked after refreshing) Device LastActiveDate should be overrode by issued Date of new refresh token',
  })
  @ApiExtraModels(AccessTokenView)
  @ApiOkResponse({
    description:
      'Returns JWT accessToken (expired after 10 seconds) in body and JWT refreshToken in cookie (http-only, secure) (expired after 20 seconds).',
    schema: {
      $ref: getSchemaPath(AccessTokenView),
    },
  })
  @ApiUnauthorizedResponse({
    description:
      'If the JWT refreshToken inside cookie is missing, expired or incorrect',
  })
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
  @ApiOperation({ summary: 'Try login user to the system' })
  @ApiExtraModels(AccessTokenView)
  @ApiOkResponse({
    description:
      'Returns JWT accessToken (expired after 10 seconds) in body and JWT refreshToken in cookie (http-only, secure) (expired after 20 seconds).',
    schema: {
      $ref: getSchemaPath(AccessTokenView),
    },
  })
  @ApiExtraModels(ErrorsMessages)
  @ApiBadRequestResponse({
    description: 'If the inputModel has incorrect values',
    schema: {
      $ref: getSchemaPath(ErrorsMessages),
    },
  })
  @ApiUnauthorizedResponse({
    description:
      'If the JWT refreshToken inside cookie is missing, expired or incorrect',
  })
  @ApiTooManyRequestsResponse({
    description: 'More than 5 attempts from one IP-address during 10 seconds',
  })
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
  @ApiOperation({
    summary:
      'In cookie client must send correct refreshToken that will be revoked',
  })
  @ApiNoContentResponse({
    description: 'No Content',
  })
  @ApiUnauthorizedResponse({
    description:
      'If the JWT refreshToken inside cookie is missing, expired or incorrect',
  })
  @UseGuards(JwtRefreshGuard)
  @HttpCode(204)
  async logout(@RefreshToken() refreshToken: string): Promise<boolean> {
    const decodedToken: any = this.jwtService.decode(refreshToken);

    return this.commandBus.execute(
      new TerminateSessionLogoutCommand(decodedToken.deviceId),
    );
  }
}
