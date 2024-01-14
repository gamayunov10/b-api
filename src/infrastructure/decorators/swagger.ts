import { ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { applyDecorators, UseGuards } from '@nestjs/common';

export function CustomApiOperation(summary: string, guard?: any) {
  const decorators: Array<
    ClassDecorator | MethodDecorator | PropertyDecorator
  > = [ApiOperation({ summary })];

  if (guard) {
    decorators.push(ApiBearerAuth(), UseGuards(guard));
  }

  return applyDecorators(...decorators);
}
