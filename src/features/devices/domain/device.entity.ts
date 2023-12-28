import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('devices')
export class Device {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'deviceId', type: 'character varying' })
  deviceId: string;

  @Column({ type: 'character varying' })
  ip: string;

  @Column({ type: 'character varying' })
  title: string;

  @Column({ name: 'lastActiveDate', type: 'timestamp with time zone' })
  lastActiveDate: Date;

  @Column({ name: 'expirationDate', type: 'timestamp with time zone' })
  expirationDate: Date;

  @Column({ name: 'userId', type: 'integer' })
  userId: number;
}
