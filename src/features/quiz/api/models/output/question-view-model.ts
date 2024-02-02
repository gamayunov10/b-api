import { ApiProperty } from '@nestjs/swagger';

export class QuestionViewModel {
  @ApiProperty({
    type: String,
  })
  id: string;

  @ApiProperty({
    type: String,
    description: 'Here is the question itself',
  })
  body: string;
}
