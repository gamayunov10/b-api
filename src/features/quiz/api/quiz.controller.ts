import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags } from '@nestjs/swagger';

import { SwaggerOptions } from '../../../infrastructure/decorators/swagger';
import { JwtBearerGuard } from '../../auth/guards/jwt-bearer.guard';
import { UserIdFromGuard } from '../../auth/decorators/user-id-from-guard.guard.decorator';
import { QuizConnectUserCommand } from '../applications/usecases/connect-user.usecase';
import { ResultCode } from '../../../base/enums/result-code.enum';
import { exceptionHandler } from '../../../infrastructure/exception-filters/exception.handler';
import { GameQueryRepository } from '../infrastructure/game.query.repository';
import { QuizSendAnswerCommand } from '../applications/usecases/send-answer.usecase';
import {
  gameField,
  gameNotFound,
  userIdField,
  userNotFound,
} from '../../../base/constants/constants';
import { ErrorsMessages } from '../../../base/schemas/api-errors-messages.schema';
import { GameFinder } from '../applications/usecases/find-game.usecase';
import { GameSchema } from '../../../base/schemas/game.schema';
import { TopGamePlayerSchema } from '../../../base/schemas/top-game-player.schema';

import { GamePairViewModel } from './models/output/game-pair-view-model';
import { AnswerInputModel } from './models/input/answer-input-model';
import { AnswerViewModel } from './models/output/answer-view-model';
import { MyStatisticViewModel } from './models/output/my-statistic-view-model';
import { GameQueryModel } from './models/input/game.query.model';
import { PlayerTopQueryModel } from './models/input/player-top.query.model';

@ApiTags('pair-game-quiz')
@Controller('pair-game-quiz')
export class QuizController {
  constructor(
    private commandBus: CommandBus,
    private queryBus: QueryBus,
    private readonly gameQueryRepository: GameQueryRepository,
  ) {}

  @Get('pairs/my-current')
  @SwaggerOptions(
    'Returns current unfinished user game',
    true,
    false,
    200,
    'Returns current pair in which current user is taking part',
    GamePairViewModel,
    false,
    false,
    true,
    false,
    true,
    false,
  )
  @UseGuards(JwtBearerGuard)
  async findCurrentGame(@UserIdFromGuard() userId: string) {
    const result = await this.gameQueryRepository.findCurrentGame(+userId);

    if (!result) {
      return exceptionHandler(ResultCode.NotFound, gameNotFound, gameField);
    }

    return result;
  }

  @Get('pairs/my')
  @SwaggerOptions(
    'Returns all my games (closed games and current)',
    true,
    false,
    200,
    'Returns pair by id if current user is taking part in this pair',
    GameSchema,
    false,
    false,
    true,
    false,
    false,
    false,
  )
  @UseGuards(JwtBearerGuard)
  async findMyGames(
    @Query() query: GameQueryModel,
    @UserIdFromGuard() userId: string,
  ) {
    if (isNaN(+userId)) {
      return exceptionHandler(
        ResultCode.Unauthorized,
        userNotFound,
        userIdField,
      );
    }

    return this.gameQueryRepository.findMyGames(query, +userId);
  }

  @Get('users/top')
  @SwaggerOptions(
    'Get users top',
    false,
    false,
    200,
    '',
    TopGamePlayerSchema,
    false,
    false,
    false,
    false,
    false,
    false,
  )
  async getTop(@Query() query: PlayerTopQueryModel) {
    return this.gameQueryRepository.getTop(query);
  }

  @Get('pairs/:id')
  @SwaggerOptions(
    'Returns game by id',
    true,
    false,
    200,
    'Returns pair by id',
    GamePairViewModel,
    'If id has invalid format',
    ErrorsMessages,
    true,
    'If current user tries to get pair in which user is not participant',
    'If game not found',
    false,
  )
  @UseGuards(JwtBearerGuard)
  async findGame(
    @Param('id') gameId: string,
    @UserIdFromGuard() userId: string,
  ) {
    const result = await this.queryBus.execute(new GameFinder(gameId, userId));

    if (result.code !== ResultCode.Success) {
      return exceptionHandler(result.code, result.message, result.field);
    }

    return result.response;
  }

  @Get('users/my-statistic')
  @SwaggerOptions(
    'Get current user statistic',
    true,
    false,
    200,
    'Returns pair by id',
    MyStatisticViewModel,
    false,
    false,
    true,
    false,
    false,
    false,
  )
  @UseGuards(JwtBearerGuard)
  async getStatistics(@UserIdFromGuard() userId: string) {
    if (isNaN(+userId)) {
      return exceptionHandler(
        ResultCode.Unauthorized,
        userNotFound,
        userIdField,
      );
    }

    return this.gameQueryRepository.getStatistics(+userId);
  }

  @Post('pairs/connection')
  @SwaggerOptions(
    'Connect current user to existing random pending pair or create new pair which will be waiting second player',
    true,
    false,
    200,
    'Returns started existing pair or new pair with status "PendingSecondPlayer"',
    GamePairViewModel,
    false,
    false,
    true,
    'If current user is already participating in active pair',
    false,
    false,
  )
  @UseGuards(JwtBearerGuard)
  @HttpCode(200)
  async connectUser(@UserIdFromGuard() userId: string) {
    const result = await this.commandBus.execute(
      new QuizConnectUserCommand(userId),
    );

    if (result.code !== ResultCode.Success) {
      return exceptionHandler(result.code, result.message, result.field);
    }

    return this.gameQueryRepository.findGameById(result.response);
  }

  @Post('pairs/my-current/answers')
  @SwaggerOptions(
    'Send answer for next not answered question in active pair',
    true,
    false,
    200,
    'Returns answer result',
    AnswerViewModel,
    false,
    false,
    true,
    'If current user is not inside active pair or user is in active pair but has already answered to all questions',
    false,
    false,
  )
  @UseGuards(JwtBearerGuard)
  @HttpCode(200)
  async sendAnswer(
    @Body() answerInputModel: AnswerInputModel,
    @UserIdFromGuard() userId: string,
  ) {
    const gameId = await this.commandBus.execute(
      new QuizSendAnswerCommand(answerInputModel, userId),
    );

    if (gameId.code !== ResultCode.Success) {
      return exceptionHandler(gameId.code, gameId.message, gameId.field);
    }

    return this.gameQueryRepository.findAnswerInGame(gameId.response, userId);
  }
}
