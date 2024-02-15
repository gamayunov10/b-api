import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { QuestionInputModel } from '../../api/models/input/question-input-model';
import { QuestionsRepository } from '../../infrastructure/questions.repository';
import { QuestionsQueryRepository } from '../../infrastructure/questions.query.repository';
import { isValidUuid } from '../../../../base/utils/is-valid-uuid';

export class QuestionUpdateCommand {
  constructor(
    public questionInputModel: QuestionInputModel,
    public questionId: string,
  ) {}
}

@CommandHandler(QuestionUpdateCommand)
export class QuestionUpdateUseCase
  implements ICommandHandler<QuestionUpdateCommand>
{
  constructor(
    private readonly questionsRepository: QuestionsRepository,
    private readonly questionsQueryRepository: QuestionsQueryRepository,
  ) {}

  async execute(command: QuestionUpdateCommand): Promise<boolean | null> {
    if (!isValidUuid(command.questionId)) {
      return null;
    }

    const question = await this.questionsQueryRepository.findQuestion(
      command.questionId,
    );

    if (!question) {
      return null;
    }

    const result = await this.questionsRepository.updateQuestion(
      command.questionId,
      command.questionInputModel,
    );

    if (!result) {
      throw new Error('Unexpected error ocurred while updating question');
    }

    return result;
  }
}
