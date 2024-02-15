import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { QuestionInputModel } from '../../api/models/input/question-input-model';
import { QuestionsRepository } from '../../infrastructure/questions.repository';

export class QuestionCreateCommand {
  constructor(public questionInputModel: QuestionInputModel) {}
}

@CommandHandler(QuestionCreateCommand)
export class QuestionCreateUseCase
  implements ICommandHandler<QuestionCreateCommand>
{
  constructor(private readonly questionsRepository: QuestionsRepository) {}

  async execute(command: QuestionCreateCommand): Promise<string> {
    return await this.questionsRepository.createQuestion(
      command.questionInputModel,
    );
  }
}
