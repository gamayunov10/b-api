import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

import { LoginAndPasswordValidationCommand } from '../api/public/application/usecases/validations/login-password-validation.usecase';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private commandBus: CommandBus) {
    super({
      usernameField: 'loginOrEmail',
    });
  }

  async validate(loginOrEmail: string, password: string): Promise<any> {
    const user = await this.commandBus.execute(
      new LoginAndPasswordValidationCommand(loginOrEmail, password),
    );

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
