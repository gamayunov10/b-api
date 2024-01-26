import { AnswerStatuses } from '../../../../../base/enums/answer-statuses';

export class AnswerViewModel {
  questionId: string;
  answerStatus: AnswerStatuses;
  addedAt: Date;
}
