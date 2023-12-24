import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import { DevicesController } from 'src/features/devices/api/devices.controller';
import { LoginDeviceUseCase } from 'src/features/devices/application/usecases/login-device.usecase';
import { TerminateOtherSessionsUseCase } from 'src/features/devices/application/usecases/terminate-other-sessions.usecase';
import { TerminateSessionUseCase } from 'src/features/devices/application/usecases/terminate-session.usecase';
import { UpdateTokensUseCase } from 'src/features/devices/application/usecases/update-tokens.usecase';
import { DevicesRepository } from 'src/features/devices/infrastructure/devices.repository';
import { UsersController } from 'src/features/users/api/users.controller';
import { UserCreateUseCase } from 'src/features/users/application/usecases/create-user.usecase';
import { UserDeleteUseCase } from 'src/features/users/application/usecases/delete-user.usecase';
import { UsersQueryRepository } from 'src/features/users/infrastructure/users.query.repository';
import { UsersRepository } from 'src/features/users/infrastructure/users.repository';
import { IsEmailAlreadyExistConstraint } from 'src/infrastructure/decorators/unique-email.decorator';
import { IsLoginAlreadyExistConstraint } from 'src/infrastructure/decorators/unique-login.decorator';
import { ThrottlerModule } from '@nestjs/throttler';
import { PassportModule } from '@nestjs/passport';

import { TestingController } from '../../testing/testing.controller';
import { AuthService } from '../../features/auth/api/public/application/usecases/auth.service';
import { RegistrationUseCase } from '../../features/auth/api/public/application/usecases/registration/registration.usecase';
import { RegistrationEmailResendUseCase } from '../../features/auth/api/public/application/usecases/registration/registration-email-resend.usecase';
import { RegistrationConfirmationUseCase } from '../../features/auth/api/public/application/usecases/registration/registration-confirmation.usecase';
import { PasswordRecoveryUseCase } from '../../features/auth/api/public/application/usecases/password/password-recovery.usecase';
import { PasswordUpdateUseCase } from '../../features/auth/api/public/application/usecases/password/password-update.usecase';
import { ValidateRefreshTokenUseCase } from '../../features/auth/api/public/application/usecases/validations/validate-refresh-token.usecase';
import { TokensCreateUseCase } from '../../features/auth/api/public/application/usecases/tokens/tokens-create.usecase';
import { BasicStrategy } from '../../features/auth/strategies/basic.strategy';
import { JwtBearerStrategy } from '../../features/auth/strategies/jwt-bearer.strategy';
import { JwtRefreshTokenStrategy } from '../../features/auth/strategies/jwt-refresh.strategy';
import { LocalStrategy } from '../../features/auth/strategies/local.strategy';

const controllers = [UsersController, DevicesController, TestingController];

const services = [JwtService, AuthService];

const useCases = [
  UserCreateUseCase,
  UserDeleteUseCase,
  LoginDeviceUseCase,
  TerminateOtherSessionsUseCase,
  TerminateSessionUseCase,
  UpdateTokensUseCase,
  RegistrationUseCase,
  RegistrationEmailResendUseCase,
  RegistrationConfirmationUseCase,
  PasswordRecoveryUseCase,
  PasswordUpdateUseCase,
  ValidateRefreshTokenUseCase,
  TokensCreateUseCase,
];

const repositories = [UsersRepository, DevicesRepository];

const queryRepositories = [UsersQueryRepository];

const constraints = [
  IsEmailAlreadyExistConstraint,
  IsLoginAlreadyExistConstraint,
];

const strategies = [
  BasicStrategy,
  JwtBearerStrategy,
  JwtRefreshTokenStrategy,
  LocalStrategy,
];

@Module({
  imports: [
    CqrsModule,
    ThrottlerModule.forRoot({
      ttl: 10,
      limit: 5,
    }),
    PassportModule,
  ],
  controllers: [...controllers],
  providers: [
    ...services,
    ...useCases,
    ...repositories,
    ...queryRepositories,
    ...constraints,
    ...strategies,
  ],
})
export class MainModule {}
