import { ApiProperty } from '@nestjs/swagger';
import { MaxLength } from 'class-validator';

export class PostInputModel {
  @ApiProperty({
    type: String,
    maxLength: 30,
  })
  @MaxLength(30)
  title: string;

  @ApiProperty({ name: 'shortDescription', type: String, maxLength: 100 })
  @MaxLength(100)
  shortDescription: string;

  @ApiProperty({ type: String, maxLength: 1000 })
  @MaxLength(1000)
  content: string;
}
