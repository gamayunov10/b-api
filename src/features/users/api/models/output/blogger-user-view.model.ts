import { ApiProperty } from '@nestjs/swagger';

import { BanInfoViewModel } from './ban-info-view.model';

export class BloggerUserViewModel {
  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ type: String })
  login: string;

  @ApiProperty({ type: BanInfoViewModel })
  banInfo: BanInfoViewModel;
}
