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
import { DeviceAuthSessions } from '../../features/devices/domain/device.entity';
import { User } from '../../features/users/domain/user.entity';
import { BasicStrategy } from '../../features/auth/strategies/basic.strategy';
import { JwtBearerStrategy } from '../../features/auth/strategies/jwt-bearer.strategy';
import { LocalStrategy } from '../../features/auth/strategies/local.strategy';
import { IsDeviceExist } from '../../infrastructure/middlewares/is-device-exist.middleware';
import { DevicesQueryRepository } from '../../features/devices/infrastructure/devices.query.repository';
import { DevicesController } from '../../features/devices/api/devices.controller';
import { SAUsersController } from '../../features/users/api/sa-users.controller';
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
import { BlogCreateUseCase } from '../../features/blogs/application/usecases/create-blog.usecase';
import { BlogsRepository } from '../../features/blogs/infrastructure/blogs.repository';
import { BlogsQueryRepository } from '../../features/blogs/infrastructure/blogs.query.repository';
import { SABlogsController } from '../../features/blogs/api/sa-blogs.controller';
import { BlogUpdateUseCase } from '../../features/blogs/application/usecases/update-blog.usecase';
import { BlogDeleteUseCase } from '../../features/blogs/application/usecases/delete-blog.usecase';
import { PostsQueryRepository } from '../../features/posts/infrastructure/posts.query.repository';
import { PostsRepository } from '../../features/posts/infrastructure/posts.repository';
import { PostsController } from '../../features/posts/api/posts.controller';
import { PostCreatePostForSpecificBlogUseCase } from '../../features/posts/application/usecases/create-post-for-specific-blog.usecase';
import { PostUpdatePostForSpecificBlogUseCase } from '../../features/posts/application/usecases/update-post-for-specific-blog.usecase';
import { PostDeleteUseCase } from '../../features/posts/application/usecases/delete-post.usecase';
import { BlogsController } from '../../features/blogs/api/blogs.controller';
import { PostCreateCommentUseCase } from '../../features/posts/application/usecases/create-comment-for-post.usecase';
import { CommentsQueryRepository } from '../../features/comments/infrastructure/comments.query.repository';
import { CommentsRepository } from '../../features/comments/infrastructure/comments.repository';
import { CommentsController } from '../../features/comments/api/comments.controller';
import { CommentUpdateUseCase } from '../../features/comments/application/usecases/update-comment.usecase';
import { CommentDeleteUseCase } from '../../features/comments/application/usecases/delete-comment.usecase';
import { PostLikeOperationUseCase } from '../../features/posts/application/usecases/post-like-operation.usecase';
import { CommentLikeOperationUseCase } from '../../features/comments/application/usecases/comment-like-operation.usecase';

const controllers = [
  SAUsersController,
  SABlogsController,
  BlogsController,
  PostsController,
  DevicesController,
  AuthController,
  TestingController,
  CommentsController,
];

const services = [JwtService, AuthService];

const entities = [DeviceAuthSessions, User];
const typeORMRepositories = [Repository<User>, Repository<DeviceAuthSessions>];

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
  BlogCreateUseCase,
  BlogUpdateUseCase,
  BlogDeleteUseCase,
  PostCreatePostForSpecificBlogUseCase,
  PostUpdatePostForSpecificBlogUseCase,
  PostDeleteUseCase,
  PostCreateCommentUseCase,
  CommentUpdateUseCase,
  CommentDeleteUseCase,
  PostLikeOperationUseCase,
  CommentLikeOperationUseCase,
];

const repositories = [
  UsersRepository,
  DevicesRepository,
  BlogsRepository,
  PostsRepository,
  CommentsRepository,
];

const queryRepositories = [
  UsersQueryRepository,
  DevicesQueryRepository,
  BlogsQueryRepository,
  PostsQueryRepository,
  CommentsQueryRepository,
];

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
