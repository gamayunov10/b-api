import { ApiProperty } from '@nestjs/swagger';

import { PlayerViewModel } from './player-view-model';

export class TopGamePlayerViewModel {
  @ApiProperty({
    type: Number,
    description: 'Sum scores of all games',
  })
  sumScore: number;

  @ApiProperty({
    type: Number,
    description: 'Average score of all games rounded to 2 decimal places',
  })
  avgScores: number;

  @ApiProperty({
    type: Number,
    description: 'All played games count',
  })
  gamesCount: number;

  @ApiProperty({
    type: Number,
  })
  winsCount: number;

  @ApiProperty({
    type: Number,
  })
  lossesCount: number;

  @ApiProperty({
    type: Number,
  })
  drawsCount: number;

  @ApiProperty({
    type: PlayerViewModel,
  })
  player: PlayerViewModel;
}
