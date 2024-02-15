import { QuizPlayer } from '../../features/quiz/domain/quiz-player';
import { QuizAnswer } from '../../features/quiz/domain/quiz-answer.entity';
import { QuizGame } from '../../features/quiz/domain/quiz-game.entity';
import { QuizQuestion } from '../../features/quiz/domain/quiz-question.entity';
import { User } from '../../features/users/domain/user.entity';
import { UserEmailConfirmation } from '../../features/users/domain/user-email-confirmation.entity';
import { UserPasswordRecovery } from '../../features/users/domain/user-password-recovery.entity';
import { Blog } from '../../features/blogs/domain/blog.entity';
import { Comment } from '../../features/comments/domain/comment.entity';
import { CommentLike } from '../../features/comments/domain/comment-like.entity';
import { Post } from '../../features/posts/domain/post.entity';
import { PostLike } from '../../features/posts/domain/post-like.entity';
import { DeviceAuthSessions } from '../../features/devices/domain/device.entity';

export type TypeOrmEntity =
  | QuizPlayer
  | QuizAnswer
  | QuizGame
  | QuizQuestion
  | User
  | UserEmailConfirmation
  | UserPasswordRecovery
  | Blog
  | Comment
  | CommentLike
  | Post
  | PostLike
  | DeviceAuthSessions;
