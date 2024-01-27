import { IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PublishedInputModel {
  @ApiProperty({
    type: Boolean,
    description:
      'True if question is completed and can be used in the Quiz game',
  })
  @IsBoolean()
  published: boolean;
}
