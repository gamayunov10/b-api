import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { PublishedInputModel } from '../../api/models/input/published-input-model';
import { QuestionsRepository } from '../../infrastructure/questions.repository';
import { QuestionsQueryRepository } from '../../infrastructure/questions.query.repository';
import { isValidUuid } from '../../../../base/utils/is-valid-uuid';

export class QuestionPublishCommand {
  constructor(
    public questionId: string,
    public publishedInputModel: PublishedInputModel,
  ) {}
}

@CommandHandler(QuestionPublishCommand)
export class QuestionPublishUseCase
  implements ICommandHandler<QuestionPublishCommand>
{
  constructor(
    private readonly questionsRepository: QuestionsRepository,
    private readonly questionsQueryRepository: QuestionsQueryRepository,
  ) {}

  async execute(command: QuestionPublishCommand): Promise<boolean | null> {
    if (!isValidUuid(command.questionId)) {
      return null;
    }

    const question = await this.questionsQueryRepository.findQuestion(
      command.questionId,
    );

    if (!question) {
      return null;
    }

    const result = await this.questionsRepository.updatePublish(
      command.questionId,
      command.publishedInputModel,
    );

    if (!result) {
      throw new Error('Unexpected error ocurred while updating question');
    }

    return result;
  }
}
