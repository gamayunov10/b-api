import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { QuizAnswer } from './quiz-answer.entity';
import { QuizGame } from './quiz-game.entity';

@Entity('quiz_questions')
export class QuizQuestion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', width: 500 })
  body: string;

  @Column({ name: 'correct_answers', type: 'jsonb', default: [] })
  correctAnswers;

  @Column({ type: 'boolean', default: false })
  published: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @Column({
    name: 'updated_at',
    type: 'timestamp with time zone',
    nullable: true,
  })
  updatedAt: Date;

  @OneToMany(() => QuizAnswer, (answer) => answer.question, {
    onDelete: 'CASCADE',
  })
  answers: QuizAnswer[];

  @ManyToMany(() => QuizGame, (game) => game.questions, {
    onDelete: 'CASCADE',
  })
  @JoinTable()
  games: QuizGame[];
}
