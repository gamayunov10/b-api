import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiTags } from '@nestjs/swagger';

import { BasicAuthGuard } from '../../auth/guards/basic-auth.guard';
import { SwaggerOptions } from '../../../infrastructure/decorators/swagger';
import { ErrorsMessages } from '../../../base/schemas/api-errors-messages.schema';
import { QuestionCreateCommand } from '../applications/usecases/question-create.use-case';
import { QuestionsQueryRepository } from '../infrastructure/questions.query.repository';

import { QuestionInputModel } from './models/input/question-input-model';
import { QuestionViewModel } from './models/output/question-view-model';

@ApiTags('sa/quiz/questions')
@Controller('sa/quiz/questions')
export class SAQuizController {
  constructor(
    private commandBus: CommandBus,
    private readonly questionsQueryRepository: QuestionsQueryRepository,
  ) {}

  @Post()
  @SwaggerOptions(
    'Create question',
    false,
    true,
    201,
    'Created',
    QuestionViewModel,
    'If the inputModel has incorrect values',
    ErrorsMessages,
    true,
    false,
    false,
    false,
  )
  @UseGuards(BasicAuthGuard)
  async createQuestion(@Body() questionInputModel: QuestionInputModel) {
    const questionId = await this.commandBus.execute(
      new QuestionCreateCommand(questionInputModel),
    );

    return this.questionsQueryRepository.findQuestion(questionId);
  }
}
