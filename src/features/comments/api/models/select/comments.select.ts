import { LikeStatus } from '../../../../../base/enums/like_status.enum';

export interface ICommentsSelect {
  id: number;
  content: string;
  userId: number;
  userLogin: string;
  createdAt: Date;
  likesCount?: number;
  dislikesCount?: number;
  myStatus?: LikeStatus;
}
