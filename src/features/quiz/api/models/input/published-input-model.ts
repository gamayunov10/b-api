import { IsBoolean, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PublishedInputModel {
  @ApiProperty({
    type: Boolean,
  })
  @IsNotEmpty()
  @IsBoolean()
  published: boolean;
}
