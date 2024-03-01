import { ApiProperty } from '@nestjs/swagger';

import { PhotoSizeViewModel } from './photo-size-view.model';

export class PostImagesViewModel {
  @ApiProperty({
    type: [PhotoSizeViewModel],
    nullable: true,
    description:
      'Must contain original photo size (940x432) and middle photo (300x180) and small (149x96)',
  })
  main: PhotoSizeViewModel[] | null;
}
