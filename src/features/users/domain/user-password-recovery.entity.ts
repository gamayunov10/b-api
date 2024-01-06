import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('user_password_recovery')
export class UserPasswordRecovery {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'character varying', nullable: true })
  recoveryCode: string | null;

  @Column({ type: 'timestamp with time zone' })
  expirationDate: Date | null;

  @Column({ type: 'integer' })
  userId: number;
}
