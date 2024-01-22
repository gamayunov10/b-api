import { ApiProperty } from '@nestjs/swagger';
import { MaxLength } from 'class-validator';

import { IsNotEmptyString } from '../../../../../infrastructure/decorators/is-not-empty-string.decorator';

export class PostInputModel {
  @ApiProperty({
    type: String,
    maxLength: 30,
  })
  @IsNotEmptyString()
  @MaxLength(30)
  title: string;

  @ApiProperty({ name: 'shortDescription', type: String, maxLength: 100 })
  @IsNotEmptyString()
  @MaxLength(100)
  shortDescription: string;

  @ApiProperty({ type: String, maxLength: 1000 })
  @IsNotEmptyString()
  @MaxLength(1000)
  content: string;
}
