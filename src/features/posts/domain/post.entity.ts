import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Comment } from '../../comments/domain/comment.entity';
import { Blog } from '../../blogs/domain/blog.entity';

import { PostLike } from './post-like.entity';

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'character varying', width: 30 })
  title: string;

  @Column({ type: 'character varying', width: 100 })
  shortDescription: string;

  @Column({ type: 'character varying', width: 1000 })
  content: string;

  @Column({ type: 'integer' })
  blogId: number;

  @Column({ type: 'character varying' })
  blogName: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @ManyToOne(() => Blog, (blog) => blog.post, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  blog: Blog;

  @OneToMany(() => Comment, (comment) => comment.post, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  comment: Comment;

  @OneToMany(() => PostLike, (postLike) => postLike.post, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  postLike: PostLike;
}
