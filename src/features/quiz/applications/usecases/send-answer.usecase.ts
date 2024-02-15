import { CommandHandler } from '@nestjs/cqrs';
import { DataSource, EntityManager } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { add } from 'date-fns';

import { ExceptionResultType } from '../../../../infrastructure/types/exceptions.types';
import { ResultCode } from '../../../../base/enums/result-code.enum';
import {
  userIdField,
  userNotFound,
} from '../../../../base/constants/constants';
import { TransactionBaseUseCase } from '../../../../base/application/usecases/transaction-base.usecase';
import { TransactionsRepository } from '../../../../base/infrastructure/transactions.repository';
import { UsersQueryRepository } from '../../../users/infrastructure/users.query.repository';
import { GameQueryRepository } from '../../infrastructure/game.query.repository';
import { AnswerInputModel } from '../../api/models/input/answer-input-model';
import { AnswerStatuses } from '../../../../base/enums/answer-statuses';
import { QuizAnswer } from '../../domain/quiz-answer.entity';
import { GameStatuses } from '../../../../base/enums/game-statuses';
import { GameRepository } from '../../infrastructure/game.repository';

export class QuizSendAnswerCommand {
  constructor(
    public answerInputModel: AnswerInputModel,
    public userId: string,
  ) {}
}

@CommandHandler(QuizSendAnswerCommand)
export class QuizSendAnswerUseCase extends TransactionBaseUseCase<
  QuizSendAnswerCommand,
  ExceptionResultType<boolean>
> {
  constructor(
    @InjectDataSource()
    protected readonly dataSource: DataSource,
    private readonly transactionsRepository: TransactionsRepository,
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly gameQueryRepository: GameQueryRepository,
    private readonly gameRepository: GameRepository,
  ) {
    super(dataSource);
  }

  async doLogic(
    command: QuizSendAnswerCommand,
    manager: EntityManager,
  ): Promise<ExceptionResultType<boolean>> {
    const date = new Date();

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

    const playerId = await this.gameQueryRepository.findPlayerIdByUserId(
      +command.userId,
    );

    if (!playerId) {
      return {
        data: false,
        code: ResultCode.NotFound,
        field: userIdField,
        message: userNotFound,
      };
    }

    const currentGame = await this.gameQueryRepository.findGameForAnswer(
      +command.userId,
      manager,
    );

    if (!currentGame) {
      // If current user is not inside active pair or user is in active pair but has already answered to all questions
      return {
        data: false,
        code: ResultCode.Forbidden,
      };
    }

    let currentPlayer = currentGame.playerOne;

    if (
      currentGame.playerTwo &&
      +command.userId === +currentGame.playerTwo.user.id
    ) {
      currentPlayer = currentGame.playerTwo;
    }

    const questionIndex = currentPlayer.answers.length;

    if (questionIndex === 5) {
      return {
        data: false,
        code: ResultCode.Forbidden,
      };
    }

    const currentQuestion = currentGame.questions[questionIndex];

    let answerStatus = AnswerStatuses.INCORRECT;
    const answerCheck = currentQuestion?.correctAnswers.includes(
      command.answerInputModel.answer,
    );
    if (answerCheck) {
      answerStatus = AnswerStatuses.CORRECT;
      currentPlayer.score += 1;
      await this.transactionsRepository.save(currentPlayer, manager);
    }

    const answer = new QuizAnswer();
    answer.player = currentPlayer;
    answer.question = currentQuestion;
    answer.answerStatus = answerStatus;
    answer.addedAt = new Date();
    await this.transactionsRepository.save(answer, manager);

    const playerOneAnswersCount = currentGame.playerOne.answers.length;
    const playerTwoAnswersCount = currentGame.playerTwo.answers.length;

    try {
      let extraPoint = false;

      if (
        (playerOneAnswersCount + 1 === 5 &&
          currentGame.playerOne.id === currentPlayer.id) ||
        (playerTwoAnswersCount + 1 === 5 &&
          currentGame.playerTwo.id === currentPlayer.id)
      ) {
        if (
          currentGame.finishingExpirationDate !== null &&
          date > currentGame.finishingExpirationDate
        ) {
          currentGame.finishGameDate = date;
          currentGame.status = GameStatuses.FINISHED;

          await this.transactionsRepository.save(currentGame, manager);

          return {
            data: false,
            code: ResultCode.Forbidden,
          };
        }

        let fastPlayer = currentGame.playerOne;

        if (playerTwoAnswersCount + 1 === 5) {
          fastPlayer = currentGame.playerTwo;
        }

        if (fastPlayer.score !== 0 && !extraPoint) {
          fastPlayer.score += 1;
          extraPoint = true;
        }

        await this.transactionsRepository.save(fastPlayer, manager);

        currentGame.status = GameStatuses.ACTIVE;
        currentGame.finishGameDate = null;
        currentGame.finishingExpirationDate = add(new Date(), {
          seconds: 10,
        });
        await this.transactionsRepository.save(currentGame, manager);
      }
    } catch (e) {
      console.error(e);
    } finally {
      const date = new Date();

      if (
        currentGame.finishingExpirationDate !== null &&
        date > currentGame.finishingExpirationDate
      ) {
        currentGame.finishGameDate = date;
        currentGame.status = GameStatuses.FINISHED;

        await this.transactionsRepository.save(currentGame, manager);
      }

      setTimeout(async () => {
        if (
          currentGame.finishingExpirationDate !== null &&
          date < currentGame.finishingExpirationDate
        ) {
          currentGame.finishGameDate = date;
          currentGame.status = GameStatuses.FINISHED;

          await this.gameRepository.finishGame(
            currentGame.id,
            currentGame.finishingExpirationDate,
          );
        }
      }, 10000);
    }

    return {
      data: true,
      code: ResultCode.Success,
      response: currentGame.id,
    };
  }

  public async execute(command: QuizSendAnswerCommand) {
    return super.execute(command);
  }
}
