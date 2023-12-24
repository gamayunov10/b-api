import { ApiProperty } from '@nestjs/swagger';
import { Length } from 'class-validator';

import { IsStringOrEmail } from '../../../infrastructure/decorators/is-string-or-email.decorator';

export class LoginInputModel {
  @ApiProperty({ type: String })
  @IsStringOrEmail()
  loginOrEmail: string;

  @ApiProperty({ type: String, minLength: 6, maxLength: 20 })
  @Length(6, 20)
  password: string;
}
