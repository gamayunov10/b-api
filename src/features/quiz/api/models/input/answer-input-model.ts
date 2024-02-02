import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class AnswerInputModel {
  @ApiProperty({
    type: String,
  })
  @IsString()
  answer: string;
}
