import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';

import { GameQueryRepository } from '../../infrastructure/game.query.repository';
import { ExceptionResultType } from '../../../../infrastructure/types/exceptions.types';
import { ResultCode } from '../../../../base/enums/result-code.enum';
import {
  gameField,
  gameNotFound,
  userIdField,
  userNotFound,
} from '../../../../base/constants/constants';
import { UsersQueryRepository } from '../../../users/infrastructure/users.query.repository';
import { GameRepository } from '../../infrastructure/game.repository';

export class CurrentGameFinder {
  constructor(public userId: string) {}
}

@QueryHandler(CurrentGameFinder)
export class CurrentGameFindUseCase
  implements IQueryHandler<CurrentGameFinder>
{
  constructor(
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly gameQueryRepository: GameQueryRepository,
    private readonly gameRepository: GameRepository,
  ) {}

  async execute(
    query: CurrentGameFinder,
  ): Promise<ExceptionResultType<boolean>> {
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

    const currentGame = await this.gameQueryRepository.findCurrentGame(
      +query.userId,
    );

    if (!currentGame) {
      return {
        data: false,
        code: ResultCode.NotFound,
        field: gameField,
        message: gameNotFound,
      };
    }

    return {
      data: true,
      code: ResultCode.Success,
      response: currentGame,
    };
  }
}
