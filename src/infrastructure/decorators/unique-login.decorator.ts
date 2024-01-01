import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';

import { UsersQueryRepository } from '../../features/users/infrastructure/users.query.repository';

@ValidatorConstraint({ name: 'IsLoginAlreadyExist', async: true })
@Injectable()
export class IsLoginAlreadyExistConstraint
  implements ValidatorConstraintInterface
{
  constructor(private readonly usersQueryRepository: UsersQueryRepository) {}
  async validate(login: string) {
    const user = await this.usersQueryRepository.findUserByLogin(login);
    return !user;
  }
}

export const IsLoginAlreadyExist =
  (validationOptions?: ValidationOptions) =>
  (object: object, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsLoginAlreadyExistConstraint,
    });
  };
