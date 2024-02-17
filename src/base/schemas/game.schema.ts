import { ApiProperty } from '@nestjs/swagger';

import { GamePairViewModel } from '../../features/quiz/api/models/output/game-pair-view-model';

import { PaginatorSchema } from './paginator.schema';

export class GameSchema extends PaginatorSchema {
  @ApiProperty({
    type: Array(GamePairViewModel),
  })
  'items': GamePairViewModel[];
}
