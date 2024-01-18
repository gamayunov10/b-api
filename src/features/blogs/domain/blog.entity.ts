import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Post } from '../../posts/domain/post.entity';

@Entity('blogs')
export class Blog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'character varying', width: 15 })
  name: string;

  @Column({ type: 'character varying', width: 500 })
  description: string;

  @Column({ type: 'character varying', width: 100 })
  websiteUrl: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @Column({ type: 'boolean' })
  isMembership: boolean;

  @OneToMany(() => Post, (post) => post.blog, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  post: Post;
}
