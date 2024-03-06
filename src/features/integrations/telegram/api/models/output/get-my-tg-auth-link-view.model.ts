import { ApiProperty } from '@nestjs/swagger';

export class GetMyTgAuthLinkViewModel {
  @ApiProperty({
    type: String,
    nullable: true,
  })
  link: string;
}
