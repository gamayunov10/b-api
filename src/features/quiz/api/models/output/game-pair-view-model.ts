import { ApiProperty } from '@nestjs/swagger';

import { GameStatuses } from '../../../../../base/enums/game-statuses';

import { GamePlayerProgressViewModel } from './game-player-progress-view-model';
import { QuestionViewModel } from './question-view-model';

export class GamePairViewModel {
  @ApiProperty({
    type: String,
    description: 'Id of pair',
  })
  id: string;

  @ApiProperty({
    type: GamePlayerProgressViewModel,
  })
  firstPlayerProgress: GamePlayerProgressViewModel;

  @ApiProperty({
    type: GamePlayerProgressViewModel,
  })
  secondPlayerProgress: GamePlayerProgressViewModel;

  @ApiProperty({
    type: QuestionViewModel,
    nullable: true,
  })
  questions: QuestionViewModel[] | null;

  @ApiProperty({
    type: GameStatuses,
    enum: GameStatuses,
  })
  status: GameStatuses;

  @ApiProperty({
    type: Date,
    description: 'Date when first player initialized the pair',
  })
  pairCreatedDate: Date;

  @ApiProperty({
    type: Date,
    nullable: true,
    description:
      'Game starts immediately after second player connection to this pair',
  })
  startGameDate: Date | null;

  @ApiProperty({
    type: Date,
    nullable: true,
    description:
      'Game finishes immediately after both players have answered all the questions',
  })
  finishGameDate: Date | null;
}
