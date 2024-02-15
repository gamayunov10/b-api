import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';

import { QuizQuestion } from '../domain/quiz-question.entity';
import { QuestionViewModel } from '../api/models/output/question-view-model';
import { QuestionQueryModel } from '../api/models/input/question.query.model';
import { questionsFilter } from '../../../base/pagination/question-filter.paginator';
import { Paginator } from '../../../base/pagination/_paginator';

@Injectable()
export class QuestionsQueryRepository {
  constructor(
    @InjectRepository(QuizQuestion)
    private readonly questionsQueryRepository: Repository<QuizQuestion>,
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  async findRandomQuestions(
    manager: EntityManager,
  ): Promise<QuizQuestion[] | null> {
    return await manager
      .createQueryBuilder(QuizQuestion, 'q')
      .where('q.published = true')
      .orderBy('RANDOM()')
      .take(5)
      .getMany();
  }

  async findQuestions(
    query: QuestionQueryModel,
  ): Promise<Paginator<QuestionViewModel[]>> {
    const filter = questionsFilter(query.bodySearchTerm);
    const sortDirection = query.sortDirection.toUpperCase();

    const questions = await this.questionsQueryRepository
      .createQueryBuilder('q')
      .where(
        `${
          query.publishedStatus === true || query.publishedStatus === false
            ? 'q.published = :publishedStatus'
            : 'q.published is not null'
        }`,
        { publishedStatus: query.publishedStatus },
      )
      .andWhere('q.body ILIKE :body', { body: filter.bodySearchTerm })
      .orderBy(
        `q.${query.sortBy} ${
          query.sortBy !== 'createdAt' ? 'COLLATE "C"' : ''
        }`,
        sortDirection as 'ASC' | 'DESC',
      )
      .limit(+query.pageSize)
      .offset((+query.pageNumber - 1) * +query.pageSize)
      .getMany();

    const totalCount = await this.dataSource
      .createQueryBuilder()
      .select()
      .from(QuizQuestion, 'q')
      .where(
        `${
          query.publishedStatus === true || query.publishedStatus === false
            ? 'q.published = :publishedStatus'
            : 'q.published is not null'
        }`,
        { publishedStatus: query.publishedStatus },
      )
      .andWhere('q.body ILIKE :body', { body: filter.bodySearchTerm })
      .getCount();

    return Paginator.paginate({
      pageNumber: query.pageNumber,
      pageSize: query.pageSize,
      totalCount: totalCount,
      items: await this.questionsMapping(questions),
    });
  }

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
