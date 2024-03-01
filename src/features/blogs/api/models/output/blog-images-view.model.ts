import { ApiProperty } from '@nestjs/swagger';

import { PhotoSizeViewModel } from './photo-size-view.model';

export class BlogImagesViewModel {
  @ApiProperty({
    type: PhotoSizeViewModel,
  })
  wallpaper?: PhotoSizeViewModel;

  @ApiProperty({
    type: [PhotoSizeViewModel],
  })
  main: PhotoSizeViewModel[];
}
