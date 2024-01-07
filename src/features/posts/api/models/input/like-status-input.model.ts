import { IsIn } from 'class-validator';

import { LikeStatus } from '../../../../../base/enums/like_status.enum';

export class LikeStatusInputModel {
  @IsIn([LikeStatus.LIKE, LikeStatus.DISLIKE, LikeStatus.NONE], {
    message: 'Invalid like status provided',
  })
  likeStatus: string;
}
