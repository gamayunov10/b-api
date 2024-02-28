import { LikeStatus } from '../../../../../base/enums/like_status.enum';

export interface ICommentsForBlog {
  id: number;
  content: string;
  userId: number;
  userLogin: string;
  createdAt: Date;
  likesCount?: number;
  dislikesCount?: number;
  myStatus?: LikeStatus;
  postId: number;
  title: string;
  blogId: number;
  blogName: string;
}
