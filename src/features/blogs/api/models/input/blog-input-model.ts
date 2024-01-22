import { ApiProperty } from '@nestjs/swagger';
import { IsUrl, MaxLength } from 'class-validator';

import { IsNotEmptyString } from '../../../../../infrastructure/decorators/is-not-empty-string.decorator';

export class BlogInputModel {
  @ApiProperty({
    type: String,
    maxLength: 15,
  })
  @IsNotEmptyString()
  @MaxLength(15)
  name: string;

  @ApiProperty({ type: String, maxLength: 500 })
  @IsNotEmptyString()
  @MaxLength(500)
  description: string;

  @ApiProperty({ type: String, maxLength: 100 })
  @MaxLength(100)
  @IsUrl()
  websiteUrl: string;
}
