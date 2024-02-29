import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as process from 'process';

import { User } from '../features/users/domain/user.entity';
import { Blog } from '../features/blogs/domain/blog.entity';
import { CommentLike } from '../features/comments/domain/comment-like.entity';
import { Comment } from '../features/comments/domain/comment.entity';
import { DeviceAuthSessions } from '../features/devices/domain/device.entity';
import { Post } from '../features/posts/domain/post.entity';
import { PostLike } from '../features/posts/domain/post-like.entity';
import { UserEmailConfirmation } from '../features/users/domain/user-email-confirmation.entity';
import { UserPasswordRecovery } from '../features/users/domain/user-password-recovery.entity';
import { QuizAnswer } from '../features/quiz/domain/quiz-answer.entity';
import { QuizGame } from '../features/quiz/domain/quiz-game.entity';
import { QuizPlayer } from '../features/quiz/domain/quiz-player';
import { QuizQuestion } from '../features/quiz/domain/quiz-question.entity';
import { UserBanInfo } from '../features/users/domain/user-ban.entity';
import { UserBanByBlogger } from '../features/users/domain/user-ban-by-blogger.entity';
import { BlogBan } from '../features/blogs/domain/blog-ban.entity';
import { BlogMainImage } from '../features/blogs/domain/blog-main-image';

export const postgresConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.POSTGRES_HOST,
  port: 5432,
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DATABASE,
  autoLoadEntities: false,
  synchronize: false,
  logging: 'all',
  logger: 'debug',
  entities: [
    User,
    Blog,
    CommentLike,
    Comment,
    DeviceAuthSessions,
    Post,
    PostLike,
    UserEmailConfirmation,
    UserPasswordRecovery,
    QuizAnswer,
    QuizGame,
    QuizPlayer,
    QuizQuestion,
    UserBanInfo,
    UserBanByBlogger,
    BlogBan,
    BlogMainImage,
  ],
  ssl: true,
  extra: {
    ssl: {
      rejectUnauthorized: false,
    },
  },
};
