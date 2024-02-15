import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { User } from '../../users/domain/user.entity';

import { QuizAnswer } from './quiz-answer.entity';
import { QuizGame } from './quiz-game.entity';

@Entity('quiz_players')
export class QuizPlayer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'score',
    type: 'int',
  })
  score: number;

  @OneToOne(() => QuizGame)
  game: QuizGame;

  @OneToMany(() => QuizAnswer, (answer) => answer.player, {
    onDelete: 'CASCADE',
  })
  answers: QuizAnswer[];

  @ManyToOne(() => User, (user) => user.player, {
    onDelete: 'CASCADE',
  })
  user: User;
}
