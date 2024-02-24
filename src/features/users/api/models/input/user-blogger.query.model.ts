import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

import { QueryModel } from '../../../../../base/models/query.model';

export class UserBloggerQueryModel extends QueryModel {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  searchLoginTerm: string;
}
