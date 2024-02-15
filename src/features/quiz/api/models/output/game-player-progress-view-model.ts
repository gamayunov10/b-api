import { ApiProperty } from '@nestjs/swagger';

import { PlayerViewModel } from './player-view-model';
import { AnswerViewModel } from './answer-view-model';

export class GamePlayerProgressViewModel {
  @ApiProperty({
    type: AnswerViewModel,
  })
  answers: AnswerViewModel[];

  @ApiProperty({
    type: PlayerViewModel,
  })
  player: PlayerViewModel;

  @ApiProperty({
    type: Number,
    description: 'Player score',
  })
  score: number;
}
