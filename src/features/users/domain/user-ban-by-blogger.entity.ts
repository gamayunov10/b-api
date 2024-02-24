import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Blog } from '../../blogs/domain/blog.entity';

import { User } from './user.entity';

@Entity('user_ban_by_blogger')
export class UserBanByBlogger {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'is_banned', type: 'bool' })
  isBanned: boolean;

  @Column({
    name: 'ban_date',
    type: 'timestamp with time zone',
    nullable: true,
  })
  banDate: Date | null;

  @Column({ name: 'ban_reason', type: 'varchar', nullable: true })
  banReason: string | null;

  @OneToOne(() => User, (user) => user.userBanByBlogger, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn()
  user: User;

  @ManyToOne(() => Blog, (blog) => blog.userBanByBlogger, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn()
  blog: Blog;
}
