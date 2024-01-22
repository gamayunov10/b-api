import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as process from 'process';

import { User } from '../../../src/features/users/domain/user.entity';
import { Blog } from '../../../src/features/blogs/domain/blog.entity';
import { CommentLike } from '../../../src/features/comments/domain/comment-like.entity';
import { Comment } from '../../../src/features/comments/domain/comment.entity';
import { DeviceAuthSessions } from '../../../src/features/devices/domain/device.entity';
import { PostLike } from '../../../src/features/posts/domain/post-like.entity';
import { UserEmailConfirmation } from '../../../src/features/users/domain/user-email-confirmation.entity';
import { UserPasswordRecovery } from '../../../src/features/users/domain/user-password-recovery.entity';
import { Post } from '../../../src/features/posts/domain/post.entity';
export const testPostgresConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.TEST_POSTGRES_HOST,
  port: 5432,
  username: process.env.TEST_POSTGRES_USER,
  password: process.env.TEST_POSTGRES_PASSWORD,
  database: process.env.TEST_POSTGRES_DATABASE,
  autoLoadEntities: true,
  synchronize: true,
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
  ],
  // ssl: true,
  // extra: {
  //   ssl: {
  //     rejectUnauthorized: false,
  //   },
  // },
};
