import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Response } from 'express';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class TokenParserMiddleware implements NestMiddleware {
  constructor(private readonly jwtService: JwtService) {}
  use(req, res: Response, next: NextFunction) {
    const token = req.headers.authorization?.split(' ')[1];

    if (token) {
      const decodedToken = this.jwtService.decode(token);

      if (!decodedToken) {
        next();
        return;
      }

      req.userId = decodedToken.userId;
    }
    next();
  }
}
