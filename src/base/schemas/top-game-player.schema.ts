import { ApiProperty } from '@nestjs/swagger';

import { TopGamePlayerViewModel } from '../../features/quiz/api/models/output/top-game-player-view-model';

import { PaginatorSchema } from './paginator.schema';

export class TopGamePlayerSchema extends PaginatorSchema {
  @ApiProperty({
    type: TopGamePlayerViewModel,
  })
  'items': TopGamePlayerViewModel[];
}
