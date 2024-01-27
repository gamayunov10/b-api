import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { QuizQuestion } from '../domain/quiz-question.entity';
import { QuestionViewModel } from '../api/models/output/question-view-model';

@Injectable()
export class QuestionsQueryRepository {
  constructor(
    @InjectRepository(QuizQuestion)
    private readonly questionsQueryRepository: Repository<QuizQuestion>,
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  async findQuestion(questionId: string): Promise<QuestionViewModel> {
    const questions = await this.questionsQueryRepository
      .createQueryBuilder('q')
      .where(`q.id = :questionId`, {
        questionId,
      })
      .getMany();

    const mappedQuestions = await this.questionsMapping(questions);
    return mappedQuestions[0];
  }

  private async questionsMapping(
    array: QuizQuestion[],
  ): Promise<QuestionViewModel[]> {
    return array.map((q) => {
      return {
        id: q.id.toString(),
        body: q.body,
        correctAnswers: q.correctAnswers,
        published: q.published,
        createdAt: q.createdAt,
        updatedAt: q.updatedAt,
      };
    });
  }
}
