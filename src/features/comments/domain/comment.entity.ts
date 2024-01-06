import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'character varying', width: 300 })
  content: string;

  @Column({ type: 'integer' })
  commentatorId: number;

  @Column({ type: 'integer' })
  postId: number;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;
}
