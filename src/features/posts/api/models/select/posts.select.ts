import { LikeStatus } from '../../../../../base/enums/like_status.enum';

export interface IPostSelect {
  id: number;
  title: string;
  shortDescription: string;
  content: string;
  blogId?: number;
  blogName: string;
  createdAt: Date;
  likesCount?: number;
  dislikesCount?: number;
  myStatus?: LikeStatus;
  newestLikes?: {
    addedAt: Date;
    userId?: number;
    login: string;
  }[];
}
