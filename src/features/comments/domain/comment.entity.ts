import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Post } from '../../posts/domain/post.entity';
import { User } from '../../users/domain/user.entity';

import { CommentLike } from './comment-like.entity';

@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'character varying', width: 300 })
  content: string;

  @Column({ type: 'integer' })
  userId: number;

  @Column({ type: 'integer' })
  postId: number;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @ManyToOne(() => User, (u) => u.comment, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  user: User;

  @ManyToOne(() => Post, (p) => p.comment, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  post: Post;

  @OneToMany(() => CommentLike, (l) => l.comment, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  commentLike: CommentLike[];
}
