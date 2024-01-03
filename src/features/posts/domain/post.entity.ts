import {
  Column,
  CreateDateColumn,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { LikeInfo } from './likes-info.entity';

@Entity()
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

  @CreateDateColumn({ name: 'createdAt', type: 'timestamp with time zone' })
  createdAt: Date;

  @OneToOne(() => LikeInfo, { cascade: true })
  likesInfo: LikeInfo;
}
