import { LikeStatus } from '../../../../../base/enums/like_status.enum';

import { LikesDetailsViewModel } from './likes-details-view.model.ts.model';

export class ExtendedLikesInfoViewModel {
  likesCount: number;
  dislikesCount: number;
  myStatus: LikeStatus;
  newestLikes: LikesDetailsViewModel;
}
