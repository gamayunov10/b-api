import { LikesInfoViewModel } from './likes-info-view.model';
import { CommentatorInfoViewModel } from './commentator-info-view.model';

export class CommentViewModel {
  id: string;
  content: string;
  commentatorInfo: CommentatorInfoViewModel;
  createdAt: boolean;
  likesInfo: LikesInfoViewModel;
}
