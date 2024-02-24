import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, MinLength } from 'class-validator';

export class UserBanInputModel {
  @ApiProperty({
    type: Boolean,
  })
  @IsBoolean()
  isBanned: boolean;

  @ApiProperty({
    type: String,
    nullable: true,
  })
  @MinLength(20)
  banReason: string;
}
