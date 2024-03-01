import { BadRequestException } from '@nestjs/common';

import { exceptionObjectType } from '../types/exceptions.types';

export const exceptionImagesFactory = (errorMessage: string) => {
  const errorObj: exceptionObjectType[] = [
    {
      message: errorMessage,
      field: 'image',
    },
  ];

  throw new BadRequestException(errorObj);
};
