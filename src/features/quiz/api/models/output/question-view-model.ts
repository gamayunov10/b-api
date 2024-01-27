import { ApiProperty } from '@nestjs/swagger';

export class QuestionViewModel {
  @ApiProperty({
    type: String,
    nullable: true,
  })
  id: string;

  @ApiProperty({
    type: String,
    nullable: true,
    description:
      'Text of question, for example: How many continents are there?',
  })
  body: string;

  @ApiProperty({
    type: String,
    nullable: true,
    description:
      'All variants of possible correct answers for current questions Examples: [6, "six", "шесть", "дофига"] In Postgres save this data in JSON column',
  })
  correctAnswers: string[] | [];

  @ApiProperty({
    type: Boolean,
    default: false,
    description: 'If question is completed and can be used in the Quiz game',
  })
  published: boolean;

  @ApiProperty({
    type: Date,
  })
  createdAt: Date;

  @ApiProperty({
    type: Date,
    nullable: true,
  })
  updatedAt: Date;
}
