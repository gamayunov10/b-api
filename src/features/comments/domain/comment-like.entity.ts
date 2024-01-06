import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('comment_likes')
export class CommentLike {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer' })
  commentId: number;

  @Column({ type: 'integer' })
  userId: number;

  @Column({ type: 'character varying' })
  likeStatus: string;
}
