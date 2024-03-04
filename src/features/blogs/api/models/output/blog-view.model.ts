import { ApiProperty } from '@nestjs/swagger';

import { BlogImagesViewModel } from './blog-images-view.model';

export class BlogViewModel {
  @ApiProperty({
    type: String,
  })
  id: string;

  @ApiProperty({
    type: String,
  })
  name: string;

  @ApiProperty({
    type: String,
  })
  description: string;

  @ApiProperty({
    type: String,
  })
  websiteUrl: string;

  @ApiProperty({
    type: Date,
  })
  createdAt: Date;

  @ApiProperty({
    type: Boolean,
  })
  isMembership: boolean;

  @ApiProperty({
    type: BlogImagesViewModel,
  })
  images: BlogImagesViewModel;
}
