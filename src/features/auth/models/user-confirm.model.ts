import { ApiProperty } from '@nestjs/swagger';

import { IsNotEmptyString } from '../../../infrastructure/decorators/is-not-empty-string.decorator';

export class ConfirmationCodeInputModel {
  @ApiProperty({ type: String })
  @IsNotEmptyString()
  code: string;
}
