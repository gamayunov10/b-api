import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { QuizGame } from '../domain/quiz-game.entity';

@Injectable()
export class GameQueryRepository {
  constructor(
    @InjectRepository(QuizGame)
    private readonly gameQueryRepository: Repository<QuizGame>,
    @InjectDataSource() private dataSource: DataSource,
  ) {}
}
