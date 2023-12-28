import { Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { StrategyType } from 'src/base/enums/strategy-type.enum';

import { jwtConstants } from '../config/constants';
import { cookieExtractor } from '../../../base/utils/cookie-extractor';
import { ValidateRefreshTokenCommand } from '../api/public/application/usecases/validations/validate-refresh-token.usecase';

@Injectable()
export class JwtRefreshTokenStrategy extends PassportStrategy(
  Strategy,
  StrategyType.REFRESH,
) {
  constructor(private commandBus: CommandBus) {
    super({
      jwtFromRequest: cookieExtractor,
      ignoreExpiration: false,
      secretOrKey: jwtConstants.refreshTokenSecret,
    });
  }

  async validate(payload: any) {
    const result = await this.commandBus.execute(
      new ValidateRefreshTokenCommand(payload),
    );

    if (!result) {
      throw new UnauthorizedException();
    }

    return {
      id: payload.sub,
    };
  }
}
