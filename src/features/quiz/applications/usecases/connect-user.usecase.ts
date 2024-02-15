import { CommandHandler } from '@nestjs/cqrs';
import { DataSource, EntityManager } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';

import { ExceptionResultType } from '../../../../infrastructure/types/exceptions.types';
import { ResultCode } from '../../../../base/enums/result-code.enum';
import {
  userIdField,
  userNotFound,
} from '../../../../base/constants/constants';
import { QuizPlayer } from '../../domain/quiz-player';
import { QuizGame } from '../../domain/quiz-game.entity';
import { GameStatuses } from '../../../../base/enums/game-statuses';
import { TransactionBaseUseCase } from '../../../../base/application/usecases/transaction-base.usecase';
import { TransactionsRepository } from '../../../../base/infrastructure/transactions.repository';
import { UsersQueryRepository } from '../../../users/infrastructure/users.query.repository';
import { GameQueryRepository } from '../../infrastructure/game.query.repository';
import { QuestionsQueryRepository } from '../../infrastructure/questions.query.repository';

export class QuizConnectUserCommand {
  constructor(public userId: string) {}
}

@CommandHandler(QuizConnectUserCommand)
export class QuizConnectUserUseCase extends TransactionBaseUseCase<
  QuizConnectUserCommand,
  ExceptionResultType<boolean>
> {
  constructor(
    @InjectDataSource()
    protected readonly dataSource: DataSource,
    private readonly transactionsRepository: TransactionsRepository,
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly gameQueryRepository: GameQueryRepository,
    private readonly questionsQueryRepository: QuestionsQueryRepository,
  ) {
    super(dataSource);
  }

  async doLogic(
    command: QuizConnectUserCommand,
    manager: EntityManager,
  ): Promise<ExceptionResultType<boolean>> {
    const user = await this.usersQueryRepository.findUserEntityById(
      command.userId,
      manager,
    );

    if (!user) {
      return {
        data: false,
        code: ResultCode.NotFound,
        field: userIdField,
        message: userNotFound,
      };
    }

    let game = await this.gameQueryRepository.findGameForConnection(
      +command.userId,
      manager,
    );

    const player = new QuizPlayer();
    player.user = user;
    player.score = 0;

    if (!game) {
      game = new QuizGame();
      game.playerOne = player;
      game.status = GameStatuses.PENDING_SECOND_PLAYER;
      game.pairCreatedDate = new Date();
    } else {
      if (
        game.status === GameStatuses.PENDING_SECOND_PLAYER &&
        +game?.playerOne?.user?.id === +command.userId
      ) {
        return {
          data: false,
          code: ResultCode.Forbidden,
        };
      }

      game.playerTwo = player;
      game.status = GameStatuses.ACTIVE;
      game.startGameDate = new Date();
      game.questions = await this.questionsQueryRepository.findRandomQuestions(
        manager,
      );
    }

    await this.transactionsRepository.save(player, manager);
    await this.transactionsRepository.save(game, manager);

    return {
      data: true,
      code: ResultCode.Success,
      response: game.id,
    };
  }

  public async execute(command: QuizConnectUserCommand) {
    return super.execute(command);
  }
}
