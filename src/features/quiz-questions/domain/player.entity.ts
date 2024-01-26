import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('quiz_players')
export class QuizPlayer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    name: 'score',
    type: 'int',
  })
  score: number;
}
