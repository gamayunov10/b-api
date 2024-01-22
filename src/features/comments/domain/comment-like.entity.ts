import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { User } from '../../users/domain/user.entity';

import { Comment } from './comment.entity';

@Entity('comment_likes')
export class CommentLike {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer' })
  commentId: number;

  @Column({ type: 'integer' })
  userId: number;

  @Column({ type: 'character varying' })
  likeStatus: string;

  @ManyToOne(() => Comment, (comment) => comment.commentLike, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  comment: Comment;

  @ManyToOne(() => User, (user) => user.commentLike, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  user: User;
}
