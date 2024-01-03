import { ApiProperty } from '@nestjs/swagger';
import { IsUrl, MaxLength } from 'class-validator';

export class BlogInputModel {
  @ApiProperty({
    type: String,
    maxLength: 15,
  })
  @MaxLength(15)
  name: string;

  @ApiProperty({ type: String, maxLength: 500 })
  @MaxLength(500)
  description: string;

  @ApiProperty({ type: String, maxLength: 100 })
  @MaxLength(100)
  @IsUrl()
  websiteUrl: string;
}
