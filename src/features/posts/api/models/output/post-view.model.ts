import { ExtendedLikesInfoViewModel } from './extended-likes-info-view.model.ts.model';

export class PostViewModel {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: Date;
  blogName: boolean;
  createdAt: boolean;
  extendedLikesInfo: ExtendedLikesInfoViewModel;
}
