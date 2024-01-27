import { Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { IsNotEmptyString } from '../../../../../infrastructure/decorators/is-not-empty-string.decorator';
import { IsArrayNotEmpty } from '../../../../../infrastructure/decorators/is-not-empty-array.decorator';

export class QuestionInputModel {
  @ApiProperty({
    type: String,
    maxLength: 500,
    minLength: 10,
  })
  @IsNotEmptyString()
  @Length(10, 500)
  body: string;

  @ApiProperty({
    type: Array,
    description:
      'All variants of possible correct answers for current questions Examples: [6, "six", "шесть", "дофига"] In Postgres save this data in JSON column',
  })
  @IsArrayNotEmpty()
  correctAnswers: string[];
}
