import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
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
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from 'src/features/auth/api/public/application/auth.service';
import { PassportModule } from '@nestjs/passport';
import { Repository } from 'typeorm';
import { LoginAndPasswordValidationUseCase } from 'src/features/auth/api/public/application/usecases/validations/login-password-validation.usecase';

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

const controllers = [
  UsersController,
  DevicesController,
  TestingController,
  AuthController,
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
    ...repositories,
    ...queryRepositories,
    ...typeORMRepositories,
    ...constraints,
    ...strategies,
    ...useCases,
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
