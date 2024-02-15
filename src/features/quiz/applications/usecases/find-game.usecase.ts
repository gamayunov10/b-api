import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';

import { GameQueryRepository } from '../../infrastructure/game.query.repository';
import { ExceptionResultType } from '../../../../infrastructure/types/exceptions.types';
import { ResultCode } from '../../../../base/enums/result-code.enum';
import {
  gameField,
  gameIDField,
  gameNotFound,
  userIdField,
  userNotFound,
  uuidNotValid,
} from '../../../../base/constants/constants';
import { UsersQueryRepository } from '../../../users/infrastructure/users.query.repository';
import { GameRepository } from '../../infrastructure/game.repository';

export class GameFinder {
  constructor(public gameId: string, public userId: string) {}
}

@QueryHandler(GameFinder)
export class GameFindUseCase implements IQueryHandler<GameFinder> {
  constructor(
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly gameQueryRepository: GameQueryRepository,
    private readonly gameRepository: GameRepository,
  ) {}

  async execute(query: GameFinder): Promise<ExceptionResultType<boolean>> {
    if (isNaN(+query.userId)) {
      throw new NotFoundException();
    }
    const user = await this.usersQueryRepository.findUserById(+query.userId);

    if (!user) {
      return {
        data: false,
        code: ResultCode.NotFound,
        field: userIdField,
        message: userNotFound,
      };
    }

    if (isNaN(+query.gameId)) {
      return {
        data: false,
        code: ResultCode.BadRequest,
        field: gameIDField,
        message: uuidNotValid,
      };
    }

    const currentGame = await this.gameQueryRepository.findGameById(
      +query.gameId,
    );

    if (!currentGame) {
      return {
        data: false,
        code: ResultCode.NotFound,
        field: gameField,
        message: gameNotFound,
      };
    }

    const playerOneProgress = currentGame.firstPlayerProgress;
    const playerTwoProgress = currentGame.secondPlayerProgress;

    // If current user tries to get pair in which user is not participant
    if (
      +playerOneProgress.player.id !== +query.userId &&
      +playerTwoProgress.player.id !== +query.userId
    ) {
      return {
        data: false,
        code: ResultCode.Forbidden,
      };
    }

    return {
      data: true,
      code: ResultCode.Success,
      response: currentGame,
    };
  }
}
