import { ApiProperty } from '@nestjs/swagger';

export class PhotoSizeViewModel {
  @ApiProperty({
    type: String,
  })
  url: string;

  @ApiProperty({
    type: Number,
    description: 'In pixels',
  })
  width: number;

  @ApiProperty({
    type: Number,
    description: 'In pixels',
  })
  height: number;

  @ApiProperty({
    type: Number,
    description: 'In bytes',
  })
  fileSize: number;
}
