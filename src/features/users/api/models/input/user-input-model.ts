import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, Length, Matches } from 'class-validator';

import { IsLoginAlreadyExist } from '../../../../../infrastructure/decorators/unique-login.decorator';
import {
  emailNotUnique,
  loginNotUnique,
} from '../../../../../base/constants/constants';
import { IsEmailAlreadyExist } from '../../../../../infrastructure/decorators/unique-email.decorator';

export class UserInputModel {
  @ApiProperty({
    type: String,
    minLength: 3,
    maxLength: 10,
    pattern: '^[a-zA-Z0-9_-]*$',
  })
  @Length(3, 10)
  @Matches(/^[a-zA-Z0-9_-]*$/, {
    message:
      'Login must contain only letters, numbers, underscores, or hyphens',
  })
  @IsLoginAlreadyExist({ message: loginNotUnique })
  login: string;

  @ApiProperty({ type: String, minLength: 6, maxLength: 20 })
  @Length(6, 20)
  password: string;

  @ApiProperty({ type: String, format: 'email' })
  @IsEmail()
  @IsEmailAlreadyExist({ message: emailNotUnique })
  email: string;
}
