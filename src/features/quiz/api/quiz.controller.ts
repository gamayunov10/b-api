import { Controller } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('sa/quiz/questions')
@Controller('sa/quiz/questions')
export class QuizController {
  constructor(private commandBus: CommandBus) {}
}
