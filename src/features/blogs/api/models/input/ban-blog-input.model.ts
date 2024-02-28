import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class BanBlogInputModel {
  @ApiProperty({
    type: Boolean,
    description: 'true - for ban blog, false - for unban blog',
  })
  @IsBoolean()
  isBanned: boolean;
}
