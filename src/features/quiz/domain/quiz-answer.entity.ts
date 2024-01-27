import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { AnswerStatuses } from '../../../base/enums/answer-statuses';

import { QuizQuestion } from './quiz-question.entity';
import { QuizPlayer } from './quiz-player';

@Entity('quiz_answers')
export class QuizAnswer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'answer_status', type: 'varchar' })
  answerStatus: AnswerStatuses;

  @CreateDateColumn({ name: 'added_at', type: 'timestamp with time zone' })
  addedAt: Date;

  @ManyToOne(() => QuizPlayer, (player) => player.answers, {
    onDelete: 'CASCADE',
  })
  player: QuizPlayer;

  @ManyToOne(() => QuizQuestion, (question) => question.answers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  question: QuizQuestion;
}
