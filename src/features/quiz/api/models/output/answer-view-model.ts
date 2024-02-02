import { ApiProperty } from '@nestjs/swagger';

import { AnswerStatuses } from '../../../../../base/enums/answer-statuses';

export class AnswerViewModel {
  @ApiProperty({
    type: String,
  })
  questionId: string;

  @ApiProperty({
    type: AnswerStatuses,
    enum: AnswerStatuses,
  })
  answerStatus: AnswerStatuses;

  @ApiProperty({
    type: Date,
  })
  addedAt: Date;
}
