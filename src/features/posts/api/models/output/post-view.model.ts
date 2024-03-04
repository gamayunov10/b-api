import { PhotoSizeViewModel } from '../../../../blogs/api/models/output/photo-size-view.model';

import { ExtendedLikesInfoViewModel } from './extended-likes-info-view.model.ts.model';

export class PostViewModel {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: Date;
  extendedLikesInfo: ExtendedLikesInfoViewModel;
  images: {
    main: PhotoSizeViewModel[];
  };
}
