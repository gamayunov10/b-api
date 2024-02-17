import { ApiProperty } from '@nestjs/swagger';

import { QuestionViewModel } from '../../features/quiz/api/models/output/question-view-model';

import { PaginatorSchema } from './paginator.schema';

export class QuestionsSchema extends PaginatorSchema {
  @ApiProperty({
    type: Array(QuestionViewModel),
  })
  'items': QuestionViewModel[];
}
