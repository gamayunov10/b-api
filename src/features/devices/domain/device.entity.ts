import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('devices')
export class Device {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'device_id', type: 'uuid' })
  deviceId: string;

  @Column({ type: 'varchar' })
  ip: string;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ name: 'last_active_date', type: 'bigint' })
  lastActiveDate: number;

  @Column({ name: 'expiration_date', type: 'bigint' })
  expirationDate: number;
}
