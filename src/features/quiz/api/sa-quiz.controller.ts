import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiTags } from '@nestjs/swagger';

import { BasicAuthGuard } from '../../auth/guards/basic-auth.guard';
import { SwaggerOptions } from '../../../infrastructure/decorators/swagger';
import { ErrorsMessages } from '../../../base/schemas/api-errors-messages.schema';
import { QuestionCreateCommand } from '../applications/usecases/question-create.use-case';
import { QuestionsQueryRepository } from '../infrastructure/questions.query.repository';
import { exceptionHandler } from '../../../infrastructure/exception-filters/exception.handler';
import { ResultCode } from '../../../base/enums/result-code.enum';
import {
  questionNotFound,
  questionField,
} from '../../../base/constants/constants';
import { QuestionUpdateCommand } from '../applications/usecases/question-update.use-case';
import { QuestionDeleteCommand } from '../applications/usecases/question-delete.use-case';
import { QuestionPublishCommand } from '../applications/usecases/question-publish.use-case';
import { QuestionsSchema } from '../../../base/schemas/questions.schema';

import { QuestionInputModel } from './models/input/question-input-model';
import { QuestionViewModel } from './models/output/question-view-model';
import { PublishedInputModel } from './models/input/published-input-model';
import { QuestionQueryModel } from './models/input/question.query.model';

@ApiTags('sa/quiz/questions')
@Controller('sa/quiz/questions')
export class SAQuizController {
  constructor(
    private commandBus: CommandBus,
    private readonly questionsQueryRepository: QuestionsQueryRepository,
  ) {}

  @Get()
  @SwaggerOptions(
    'Returns all questions with pagination and filtering',
    false,
    true,
    200,
    'Success',
    QuestionsSchema,
    false,
    false,
    true,
    false,
    false,
    false,
  )
  @UseGuards(BasicAuthGuard)
  async findQuestions(@Query() query: QuestionQueryModel) {
    return this.questionsQueryRepository.findQuestions(query);
  }

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

  @Put(':id')
  @SwaggerOptions(
    'Update question',
    false,
    true,
    204,
    'No Content',
    QuestionViewModel,
    'If the inputModel has incorrect values or property correct"Answers" are not passed but property "published" is true',
    ErrorsMessages,
    true,
    false,
    true,
    false,
  )
  @UseGuards(BasicAuthGuard)
  @HttpCode(204)
  async updateQuestion(
    @Body() questionInputModel: QuestionInputModel,
    @Param('id') questionId: string,
  ) {
    const result = await this.commandBus.execute(
      new QuestionUpdateCommand(questionInputModel, questionId),
    );

    if (!result) {
      return exceptionHandler(
        ResultCode.NotFound,
        questionNotFound,
        questionField,
      );
    }

    return result;
  }

  @Put(':id/publish')
  @SwaggerOptions(
    'Publish/unpublish question',
    false,
    true,
    204,
    'No Content',
    PublishedInputModel,
    'If the inputModel has incorrect values or specified question does not have correct answers',
    ErrorsMessages,
    true,
    false,
    false,
    false,
  )
  @UseGuards(BasicAuthGuard)
  @HttpCode(204)
  async publishQuestion(
    @Body() publishedInputModel: PublishedInputModel,
    @Param('id') questionId: string,
  ) {
    const result = await this.commandBus.execute(
      new QuestionPublishCommand(questionId, publishedInputModel),
    );

    if (!result) {
      return exceptionHandler(
        ResultCode.NotFound,
        questionNotFound,
        questionField,
      );
    }

    return result;
  }

  @Delete(':id')
  @SwaggerOptions(
    'Delete question',
    false,
    true,
    204,
    'No Content',
    false,
    false,
    false,
    true,
    false,
    true,
    false,
  )
  @UseGuards(BasicAuthGuard)
  @HttpCode(204)
  async deleteQuestion(@Param('id') questionId: string) {
    const result = await this.commandBus.execute(
      new QuestionDeleteCommand(questionId),
    );

    if (!result) {
      return exceptionHandler(
        ResultCode.NotFound,
        questionNotFound,
        questionField,
      );
    }

    return result;
  }
}
