import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { User } from '../../users/domain/user.entity';

import { Post } from './post.entity';

@Entity('post_likes')
export class PostLike {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP',
  })
  addedAt: Date;

  @Column({ type: 'integer' })
  postId: number;

  @Column({ type: 'integer' })
  userId: number;

  @Column({ type: 'character varying' })
  likeStatus: string;

  @ManyToOne(() => Post, (post) => post.postLike, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  post: Post;

  @ManyToOne(() => User, (user) => user.postLike, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  user: User;
}
