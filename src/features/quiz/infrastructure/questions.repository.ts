import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { QuizQuestion } from '../domain/quiz-question.entity';
import { QuestionInputModel } from '../api/models/input/question-input-model';

@Injectable()
export class QuestionsRepository {
  constructor(
    @InjectRepository(QuizQuestion)
    private readonly questionsRepository: Repository<QuizQuestion>,
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  async createQuestion(
    questionInputModel: QuestionInputModel,
  ): Promise<string> {
    return this.dataSource.transaction(async () => {
      const date = new Date();

      const question = await this.dataSource
        .createQueryBuilder()
        .insert()
        .into(QuizQuestion)
        .values({
          body: questionInputModel.body,
          correctAnswers: questionInputModel.correctAnswers,
          published: false,
          createdAt: date,
        })
        .returning('id')
        .execute();

      return question.identifiers[0].id;
    });
  }
}
