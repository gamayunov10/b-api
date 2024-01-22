import {
  isEmail,
  isString,
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

export function IsStringOrEmail(validationOptions?: ValidationOptions) {
  return (object: unknown, propertyName: string) => {
    registerDecorator({
      name: 'IsStringOrEmail',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate: (value: any): boolean => isEmail(value) || isString(value),
        defaultMessage: (validationArguments?: ValidationArguments): string =>
          `${validationArguments.property} should be ${validationArguments.property}`,
      },
    });
  };
}
