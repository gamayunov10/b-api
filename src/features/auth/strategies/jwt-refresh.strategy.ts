import { Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

import { jwtConstants } from '../config/constants';
import { refreshTokenExtractor } from '../../../base/utils/refresh-token-extractor';
import { ValidateRefreshTokenCommand } from '../api/public/application/usecases/validations/validate-refresh-token.usecase';
import { StrategyType } from '../../../base/enums/strategy-type.enum';

@Injectable()
export class JwtRefreshTokenStrategy extends PassportStrategy(
  Strategy,
  StrategyType.REFRESH,
) {
  constructor(private commandBus: CommandBus) {
    super({
      jwtFromRequest: refreshTokenExtractor,
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
      id: payload.userId,
    };
  }
}
