import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { PublishedStatuses } from 'src/base/enums/published-statuses';

import { QuizQuestion } from '../domain/quiz-question.entity';
import { QuestionInputModel } from '../api/models/input/question-input-model';
import { PublishedInputModel } from '../api/models/input/published-input-model';

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

  async updateQuestion(
    qId: string,
    questionInputModel: QuestionInputModel,
  ): Promise<boolean> {
    return this.dataSource.transaction(async () => {
      const date = new Date();

      const result = await this.dataSource
        .createQueryBuilder()
        .update(QuizQuestion)
        .set({
          body: questionInputModel.body,
          correctAnswers: questionInputModel.correctAnswers,
          updatedAt: date,
        })
        .where('id = :qId', { qId })
        .returning('id')
        .execute();

      return result.affected === 1;
    });
  }

  async updatePublish(
    qId: string,
    publishedInputModel: PublishedInputModel,
  ): Promise<boolean> {
    return this.dataSource.transaction(async () => {
      const date = new Date();

      const result = await this.dataSource
        .createQueryBuilder()
        .update(QuizQuestion)
        .set({
          published: publishedInputModel.published,
          updatedAt: date,
        })
        .where('id = :qId', { qId })
        .returning('id')
        .execute();

      return result.affected === 1;
    });
  }

  async deleteQuestion(qId: string): Promise<boolean> {
    const result = await this.dataSource
      .createQueryBuilder()
      .delete()
      .from(QuizQuestion)
      .where('id = :qId', { qId })
      .execute();

    return result.affected === 1;
  }
}
