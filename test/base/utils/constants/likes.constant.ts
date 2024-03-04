import { LikeStatus } from '../../../../src/base/enums/like_status.enum';

export const likeStatusInput_none = {
  likeStatus: 'None',
};
export const likeStatusInput_dislike = {
  likeStatus: 'Dislike',
};
export const likeStatusInput_like = {
  likeStatus: 'Like',
};

export const likeStatusInput_like_lowerCase = {
  likeStatus: 'like',
};

export const emptyLikeInfo = {
  likesCount: 0,
  dislikesCount: 0,
  myStatus: LikeStatus.NONE,
};
