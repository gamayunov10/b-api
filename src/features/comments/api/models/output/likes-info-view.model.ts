import { ApiProperty } from '@nestjs/swagger';

import { LikeStatus } from '../../../../../base/enums/like_status.enum';

export class LikesInfoViewModel {
  @ApiProperty({
    type: Number,
  })
  likesCount: number;

  @ApiProperty({
    type: Number,
  })
  dislikesCount: number;

  @ApiProperty({
    type: LikeStatus,
    enum: LikeStatus,
  })
  myStatus: LikeStatus;
}
