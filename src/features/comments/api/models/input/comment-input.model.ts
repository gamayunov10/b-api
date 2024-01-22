import { ApiProperty } from '@nestjs/swagger';
import { MaxLength, MinLength } from 'class-validator';

import { IsNotEmptyString } from '../../../../../infrastructure/decorators/is-not-empty-string.decorator';

export class CommentInputModel {
  @ApiProperty({
    type: String,
    minLength: 20,
    maxLength: 300,
  })
  @IsNotEmptyString()
  @MinLength(20)
  @MaxLength(300)
  content: string;
}
