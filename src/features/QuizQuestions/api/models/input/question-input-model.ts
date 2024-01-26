import { ArrayNotEmpty, IsArray, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

import { IsNotEmptyString } from '../../../../../infrastructure/decorators/is-not-empty-string.decorator';

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
    type: ArrayNotEmpty,
  })
  @IsArray()
  @ArrayNotEmpty()
  @Transform(({ value }) => {
    if (!Array.isArray(value)) {
      return false;
    } else {
      return value.map((a) => a.toString().trim());
    }
  })
  correctAnswers: string[];
}
