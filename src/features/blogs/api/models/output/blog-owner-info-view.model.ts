import { ApiProperty } from '@nestjs/swagger';

export class BlogOwnerInfoViewModel {
  @ApiProperty({
    type: String,
    nullable: true,
    description: 'Id of owner of the blog',
  })
  userId: string;

  @ApiProperty({
    type: String,
    nullable: true,
    description: 'Login of owner of the blog',
  })
  userLogin: string;
}
