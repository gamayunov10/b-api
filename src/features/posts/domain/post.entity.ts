import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

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
}
