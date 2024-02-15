import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { QuizGame } from '../domain/quiz-game.entity';
import { GameStatuses } from '../../../base/enums/game-statuses';

@Injectable()
export class GameRepository {
  constructor(
    @InjectRepository(QuizGame)
    private readonly gameRepository: Repository<QuizGame>,
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  async finishGame(gameId: number, finish_game_date: Date) {
    return this.dataSource.transaction(async (): Promise<boolean> => {
      const result = await this.dataSource
        .createQueryBuilder()
        .update(QuizGame)
        .set({
          finishGameDate: finish_game_date,
          status: GameStatuses.FINISHED,
        })
        .where('id = :gameId', { gameId })
        .execute();

      return result.affected === 1;
    });
  }
}
