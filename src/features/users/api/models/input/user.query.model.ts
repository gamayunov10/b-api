import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

import { QueryModel } from '../../../../../base/models/query.model';
import { BanStatus } from '../../../../../base/enums/ban-status.enum';

export class UserQueryModel extends QueryModel {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  searchLoginTerm: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  searchEmailTerm: string;

  @ApiProperty({ type: BanStatus, enum: BanStatus, required: false })
  @IsOptional()
  @IsString()
  banStatus: BanStatus;
}
