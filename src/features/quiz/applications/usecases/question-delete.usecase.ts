import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { QuestionsRepository } from '../../infrastructure/questions.repository';
import { QuestionsQueryRepository } from '../../infrastructure/questions.query.repository';
import { isValidUuid } from '../../../../base/utils/is-valid-uuid';

export class QuestionDeleteCommand {
  constructor(public questionId: string) {}
}

@CommandHandler(QuestionDeleteCommand)
export class QuestionDeleteUseCase
  implements ICommandHandler<QuestionDeleteCommand>
{
  constructor(
    private readonly questionsRepository: QuestionsRepository,
    private readonly questionsQueryRepository: QuestionsQueryRepository,
  ) {}

  async execute(command: QuestionDeleteCommand): Promise<boolean | null> {
    if (!isValidUuid(command.questionId)) {
      return null;
    }

    const question = await this.questionsQueryRepository.findQuestion(
      command.questionId,
    );

    if (!question) {
      return null;
    }

    return this.questionsRepository.deleteQuestion(question.id);
  }
}
