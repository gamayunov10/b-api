import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { LikeStatus } from '../../../base/enums/like_status.enum';

@Entity()
export class LikeInfo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'likesCount', type: 'integer' })
  likesCount: number;

  @Column({ name: 'dislikesCount', type: 'integer' })
  dislikesCount: number;

  @Column()
  myStatus: LikeStatus;
}
