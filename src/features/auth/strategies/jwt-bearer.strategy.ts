import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { StrategyType } from 'src/base/enums/strategy-type.enum';

import { jwtConstants } from '../config/constants';

@Injectable()
export class JwtBearerStrategy extends PassportStrategy(
  Strategy,
  StrategyType.BEARER,
) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.accessTokenSecret,
    });
  }

  async validate(payload: any) {
    return {
      id: payload.sub,
    };
  }
}
