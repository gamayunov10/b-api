import { ApiProperty } from '@nestjs/swagger';

export class PlayerViewModel {
  @ApiProperty({
    type: String,
  })
  id: string;

  @ApiProperty({
    type: String,
  })
  login: string;
}
