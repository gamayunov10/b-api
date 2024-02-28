import { ApiProperty } from '@nestjs/swagger';

import { LikesInfoViewModel } from '../../../../comments/api/models/output/likes-info-view.model';
import { PostInfoViewModel } from '../../../../posts/api/models/output/post-info-view.model';

import { BlogOwnerInfoViewModel } from './blog-owner-info-view.model';

export class BloggerCommentsViewModel {
  @ApiProperty({
    type: String,
  })
  id: string;

  @ApiProperty({
    type: String,
  })
  content: string;

  @ApiProperty({
    type: BlogOwnerInfoViewModel,
  })
  commentatorInfo: BlogOwnerInfoViewModel;

  @ApiProperty({
    type: Date,
  })
  createdAt: Date;

  @ApiProperty({
    type: LikesInfoViewModel,
  })
  likesInfo: LikesInfoViewModel;

  @ApiProperty({
    type: PostInfoViewModel,
  })
  postInfo: PostInfoViewModel;
}
