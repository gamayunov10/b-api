import { ApiProperty } from '@nestjs/swagger';

import { BlogOwnerInfoViewModel } from './blog-owner-info-view.model';
import { BlogViewModel } from './blog-view.model';

export class SABlogViewModel extends BlogViewModel {
  @ApiProperty({
    type: BlogOwnerInfoViewModel,
  })
  blogOwnerInfo: BlogOwnerInfoViewModel;
}
