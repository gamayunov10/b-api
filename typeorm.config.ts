import { config } from 'dotenv';
import { DataSource } from 'typeorm';

import { User } from './src/features/users/domain/user.entity';
import { Blog } from './src/features/blogs/domain/blog.entity';
import { CommentLike } from './src/features/comments/domain/comment-like.entity';
import { Comment } from './src/features/comments/domain/comment.entity';
import { DeviceAuthSessions } from './src/features/devices/domain/device.entity';
import { Post } from './src/features/posts/domain/post.entity';
import { PostLike } from './src/features/posts/domain/post-like.entity';
import { UserEmailConfirmation } from './src/features/users/domain/user-email-confirmation.entity';
import { UserPasswordRecovery } from './src/features/users/domain/user-password-recovery.entity';
import { QuizAnswer } from './src/features/quiz/domain/quiz-answer.entity';
import { QuizGame } from './src/features/quiz/domain/quiz-game.entity';
import { QuizPlayer } from './src/features/quiz/domain/quiz-player';
import { QuizQuestion } from './src/features/quiz/domain/quiz-question.entity';
import { UserBanInfo } from './src/features/users/domain/user-ban.entity';
import { UserBanByBlogger } from './src/features/users/domain/user-ban-by-blogger.entity';
import { BlogBan } from './src/features/blogs/domain/blog-ban.entity';
import { BlogMainImage } from './src/features/blogs/domain/blog-main-image.entity';
import { BlogWallpaperImage } from './src/features/blogs/domain/blog-wallpaper-image.entity';
import { PostMainImage } from './src/features/posts/domain/post-main-image.entity';
import { TgBlogSubscriber } from './src/features/integrations/telegram/domain/tg.blog.subscriber.entity';
import { envConfig } from './src/settings/env.config';

config();

export default new DataSource({
  type: 'postgres',
  host: envConfig.DB.POSTGRES.HOST,
  port: 5432,
  username: envConfig.DB.POSTGRES.USER,
  password: envConfig.DB.POSTGRES.PASSWORD,
  database: envConfig.DB.POSTGRES.DATABASE_NAME,
  migrations: ['migrations/*.ts'],
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
    BlogWallpaperImage,
    PostMainImage,
    TgBlogSubscriber,
  ],
});
