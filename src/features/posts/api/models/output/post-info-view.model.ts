import { ApiProperty } from '@nestjs/swagger';

export class PostInfoViewModel {
  @ApiProperty({
    type: String,
  })
  id: string;

  @ApiProperty({
    type: String,
  })
  title: string;

  @ApiProperty({
    type: String,
  })
  blogId: string;

  @ApiProperty({
    type: String,
  })
  blogName: string;
}
