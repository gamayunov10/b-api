import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

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
}
