import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Post } from '../../posts/domain/post.entity';
import { User } from '../../users/domain/user.entity';
import { UserBanByBlogger } from '../../users/domain/user-ban-by-blogger.entity';

import { BlogBan } from './blog-ban.entity';
import { BlogMainImage } from './blog-main-image.entity';
import { BlogWallpaperImage } from './blog-wallpaper-image.entity';

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

  @OneToOne(() => BlogBan, (blogBan) => blogBan.blog, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  blogBan: BlogBan;

  @OneToOne(
    () => BlogWallpaperImage,
    (blogWallpaperImage) => blogWallpaperImage.blog,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  blogWallpaperImage: BlogWallpaperImage;

  @OneToMany(() => BlogMainImage, (blogMainImages) => blogMainImages.blog, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  blogMainImages: BlogMainImage[];

  @OneToMany(
    () => UserBanByBlogger,
    (userBanByBlogger) => userBanByBlogger.blog,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  userBanByBlogger: UserBanByBlogger[];

  @OneToMany(() => Post, (post) => post.blog, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  post: Post;

  @ManyToOne(() => User, (user) => user.blog, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn()
  user: User;
}
