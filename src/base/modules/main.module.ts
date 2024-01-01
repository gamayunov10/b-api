import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { Repository } from 'typeorm';

import { TestingController } from '../../testing/testing.controller';
import { RegistrationUseCase } from '../../features/auth/api/public/application/usecases/registration/registration.usecase';
import { RegistrationEmailResendUseCase } from '../../features/auth/api/public/application/usecases/registration/registration-email-resend.usecase';
import { RegistrationConfirmationUseCase } from '../../features/auth/api/public/application/usecases/registration/registration-confirmation.usecase';
import { PasswordRecoveryUseCase } from '../../features/auth/api/public/application/usecases/password/password-recovery.usecase';
import { PasswordUpdateUseCase } from '../../features/auth/api/public/application/usecases/password/password-update.usecase';
import { ValidateRefreshTokenUseCase } from '../../features/auth/api/public/application/usecases/validations/validate-refresh-token.usecase';
import { TokensCreateUseCase } from '../../features/auth/api/public/application/usecases/tokens/tokens-create.usecase';
import { JwtRefreshTokenStrategy } from '../../features/auth/strategies/jwt-refresh.strategy';
import { AuthController } from '../../features/auth/api/public/auth.controller';
import { Device } from '../../features/devices/domain/device.entity';
import { User } from '../../features/users/domain/user.entity';
import { BasicStrategy } from '../../features/auth/strategies/basic.strategy';
import { JwtBearerStrategy } from '../../features/auth/strategies/jwt-bearer.strategy';
import { LocalStrategy } from '../../features/auth/strategies/local.strategy';
import { IsDeviceExist } from '../../infrastructure/middlewares/is-device-exist.middleware';
import { DevicesQueryRepository } from '../../features/devices/infrastructure/devices.query.repository';
import { DevicesController } from '../../features/devices/api/devices.controller';
import { UsersController } from '../../features/users/api/users.controller';
import { AuthService } from '../../features/auth/api/public/application/auth.service';
import { UserCreateUseCase } from '../../features/users/application/usecases/create-user.usecase';
import { UserDeleteUseCase } from '../../features/users/application/usecases/delete-user.usecase';
import { LoginDeviceUseCase } from '../../features/devices/application/usecases/login-device.usecase';
import { TerminateOtherSessionsUseCase } from '../../features/devices/application/usecases/terminate-other-sessions.usecase';
import { TerminateSessionUseCase } from '../../features/devices/application/usecases/terminate-session.usecase';
import { UpdateTokensUseCase } from '../../features/devices/application/usecases/update-tokens.usecase';
import { LoginAndPasswordValidationUseCase } from '../../features/auth/api/public/application/usecases/validations/login-password-validation.usecase';
import { UsersRepository } from '../../features/users/infrastructure/users.repository';
import { DevicesRepository } from '../../features/devices/infrastructure/devices.repository';
import { UsersQueryRepository } from '../../features/users/infrastructure/users.query.repository';
import { IsEmailAlreadyExistConstraint } from '../../infrastructure/decorators/unique-email.decorator';
import { IsLoginAlreadyExistConstraint } from '../../infrastructure/decorators/unique-login.decorator';
import { TerminateSessionLogoutUseCase } from '../../features/auth/api/public/application/usecases/tokens/terminate-session-logout.usecase';

const controllers = [
  UsersController,
  DevicesController,
  AuthController,
  TestingController,
];

const services = [JwtService, AuthService];

const entities = [Device, User];
const typeORMRepositories = [Repository<User>, Repository<Device>];

const useCases = [
  UserCreateUseCase,
  UserDeleteUseCase,
  LoginDeviceUseCase,
  TerminateOtherSessionsUseCase,
  TerminateSessionUseCase,
  TerminateSessionLogoutUseCase,
  UpdateTokensUseCase,
  RegistrationUseCase,
  RegistrationEmailResendUseCase,
  RegistrationConfirmationUseCase,
  PasswordRecoveryUseCase,
  PasswordUpdateUseCase,
  ValidateRefreshTokenUseCase,
  TokensCreateUseCase,
  LoginAndPasswordValidationUseCase,
];

const repositories = [UsersRepository, DevicesRepository];

const queryRepositories = [UsersQueryRepository, DevicesQueryRepository];

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
    ThrottlerModule.forRoot({
      ttl: 10,
      limit: 5,
    }),
    TypeOrmModule.forFeature([...entities]),
    CqrsModule,
    PassportModule,
  ],
  controllers: [...controllers],
  providers: [
    ...services,
    ...useCases,
    ...repositories,
    ...strategies,
    ...queryRepositories,
    ...typeORMRepositories,
    ...constraints,
  ],
})
export class MainModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(IsDeviceExist).forRoutes({
      path: 'security/devices/:id',
      method: RequestMethod.DELETE,
    });
  }
}
