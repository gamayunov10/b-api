import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

import { UserBanInputModel } from './user-ban.input.model';

export class UserBanByBloggerInputModel extends UserBanInputModel {
  @ApiProperty({
    type: String,
  })
  @IsString()
  blogId: string;
}
