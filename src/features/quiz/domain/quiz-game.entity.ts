import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { GameStatuses } from '../../../base/enums/game-statuses';

import { QuizQuestion } from './quiz-question.entity';
import { QuizPlayer } from './quiz-player';

@Entity('quiz_games')
export class QuizGame {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  status: GameStatuses;

  @CreateDateColumn({
    name: 'pair_created_date',
    type: 'timestamp with time zone',
  })
  pairCreatedDate: Date;

  @Column({
    name: 'start_game_date',
    type: 'timestamp with time zone',
    nullable: true,
  })
  startGameDate: Date;

  @Column({
    name: 'finish_game_date',
    type: 'timestamp with time zone',
    nullable: true,
  })
  finishGameDate: Date;

  @Column({
    name: 'finishing_expiration_date',
    type: 'timestamp with time zone',
    nullable: true,
  })
  finishingExpirationDate: Date;

  @OneToOne(() => QuizPlayer, (player) => player.game, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  playerOne: QuizPlayer;

  @OneToOne(() => QuizPlayer, (player) => player.game, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  playerTwo: QuizPlayer;

  @ManyToMany(() => QuizQuestion, (question) => question.games, {
    onDelete: 'CASCADE',
  })
  questions: QuizQuestion[];
}
