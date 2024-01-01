import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('deviceAuthSessions')
export class DeviceAuthSessions {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'deviceId', type: 'character varying' })
  deviceId: string;

  @Column({ type: 'character varying' })
  ip: string;

  @Column({ name: 'deviceName', type: 'character varying' })
  deviceName: string;

  @Column({ name: 'lastActiveDate', type: 'timestamp with time zone' })
  lastActiveDate: Date;

  @Column({ name: 'expirationDate', type: 'timestamp with time zone' })
  expirationDate: Date;

  @Column({ name: 'userId', type: 'integer' })
  userId: number;
}
