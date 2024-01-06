import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('post_likes')
export class PostLike {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'timestamp with time zone' })
  addedAt: Date;

  @Column({ type: 'integer' })
  postId: number;

  @Column({ type: 'integer' })
  userId: number;

  @Column({ type: 'character varying' })
  likeStatus: string;
}
