import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Blog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'character varying', width: 15 })
  name: string;

  @Column({ type: 'character varying', width: 500 })
  description: string;

  @Column({ name: 'websiteUrl', type: 'character varying', width: 100 })
  websiteUrl: string;

  @CreateDateColumn({ name: 'createdAt', type: 'timestamp with time zone' })
  createdAt: Date;

  @Column({ name: 'isMembership', type: 'boolean' })
  isMembership: boolean;
}
