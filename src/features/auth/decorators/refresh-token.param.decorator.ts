import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

export const RefreshToken = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    if (!request.cookies.refreshToken) {
      throw new UnauthorizedException('No jwt guard found');
    }
    return request.cookies.refreshToken;
  },
);
