import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { User } from './user.entity';

@Entity('user_password_recovery')
export class UserPasswordRecovery {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'character varying', nullable: true })
  recoveryCode: string;

  @Column({ type: 'timestamp with time zone' })
  expirationDate: Date;

  @Column({ type: 'integer' })
  userId: number;

  @ManyToOne(() => User, (user) => user.userPasswordRecovery)
  user: User;
}
