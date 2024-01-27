import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import process from 'process';

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

config();

export default new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST,
  port: 5432,
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DATABASE,
  synchronize: false,
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
  ],
  migrations: ['migrations/*.ts'],
});
