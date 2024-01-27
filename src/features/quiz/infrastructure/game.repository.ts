import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { QuizGame } from '../domain/quiz-game.entity';

@Injectable()
export class GameRepository {
  constructor(
    @InjectRepository(QuizGame)
    private readonly gameRepository: Repository<QuizGame>,
    @InjectDataSource() private dataSource: DataSource,
  ) {}
}
