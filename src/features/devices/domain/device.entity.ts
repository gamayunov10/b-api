import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { User } from '../../users/domain/user.entity';

@Entity('device_auth_sessions')
export class DeviceAuthSessions {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'character varying' })
  deviceId: string;

  @Column({ type: 'character varying' })
  ip: string;

  @Column({ type: 'character varying' })
  title: string;

  @Column({ type: 'timestamp with time zone' })
  lastActiveDate: Date;

  @Column({ type: 'timestamp with time zone' })
  expirationDate: Date;

  @Column({ type: 'integer' })
  userId: number;

  @ManyToOne(() => User, (u) => u.deviceAuthSessions, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  user: User;
}
