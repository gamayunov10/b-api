import { LikeStatus } from '../../../../../base/enums/like_status.enum';

export class PostOutputModel {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: Date;
  blogName: boolean;
  createdAt: boolean;
  extendedLikesInfo: {
    likesCount: number;
    dislikesCount: number;
    myStatus: LikeStatus;
    newestLikes: [];
  };
  images: {
    main:
      | [
          {
            url: string;
            width: number;
            height: number;
            fileSize: number;
          },
        ]
      | [];
  };
}
