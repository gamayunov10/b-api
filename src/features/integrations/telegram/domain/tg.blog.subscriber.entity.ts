import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Blog } from '../../../blogs/domain/blog.entity';
import { User } from '../../../users/domain/user.entity';

@Entity('tg_blog_subscribers')
export class TgBlogSubscriber {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'subscribe_status', type: 'varchar' })
  subscribeStatus: string;

  @Column('uuid', { name: 'telegram_code', nullable: true })
  telegramCode: string;

  @Column('bigint', { name: 'telegram_id', nullable: true })
  telegramId: number;

  @ManyToOne(() => Blog, (blog) => blog.tgBlogSubscriber, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    nullable: true,
  })
  @JoinColumn()
  blog: Blog;

  @ManyToOne(() => User, (user) => user.tgBlogSubscriber, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn()
  user: User;
}
