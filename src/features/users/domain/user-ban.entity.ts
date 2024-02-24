import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { User } from './user.entity';

@Entity('user_ban_info')
export class UserBanInfo {
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

  @OneToOne(() => User, (u) => u.userBanInfo, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn()
  user: User;
}
