import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('user_email_confirmation')
export class UserEmailConfirmation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'character varying', nullable: true })
  confirmationCode: string | null;

  @Column({ type: 'timestamp with time zone', nullable: true })
  expirationDate: Date | null;

  @Column({ type: 'integer' })
  userId: string;
}
