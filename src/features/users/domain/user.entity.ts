import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { PostLike } from '../../posts/domain/post-like.entity';
import { CommentLike } from '../../comments/domain/comment-like.entity';
import { Comment } from '../../comments/domain/comment.entity';
import { DeviceAuthSessions } from '../../devices/domain/device.entity';
import { QuizPlayer } from '../../quiz/domain/quiz-player';

import { UserEmailConfirmation } from './user-email-confirmation.entity';
import { UserPasswordRecovery } from './user-password-recovery.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'character varying', width: 10, unique: true })
  login: string;

  @Column({ type: 'character varying' })
  passwordHash: string;

  @Column({ type: 'character varying', unique: true })
  email: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @Column({ type: 'boolean' })
  isConfirmed: boolean;

  @OneToMany(() => DeviceAuthSessions, (d) => d.user, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  deviceAuthSessions: DeviceAuthSessions[];

  @OneToMany(() => UserEmailConfirmation, (uec) => uec.user, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  userEmailConfirmation: UserEmailConfirmation[];

  @OneToMany(() => UserPasswordRecovery, (upr) => upr.user, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  userPasswordRecovery: UserPasswordRecovery[];

  @OneToMany(() => Comment, (c) => c.user, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  comment: Comment[];

  @OneToMany(() => PostLike, (pl) => pl.post, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  postLike: PostLike[];

  @OneToMany(() => CommentLike, (cl) => cl.comment, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  commentLike: CommentLike[];

  @OneToMany(() => QuizPlayer, (player) => player.user, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  player: QuizPlayer[];
}
