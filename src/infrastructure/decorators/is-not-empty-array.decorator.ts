import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function IsArrayNotEmpty(validationOptions?: ValidationOptions) {
  return function (object: unknown, propertyName: string) {
    registerDecorator({
      name: 'isArrayNotEmpty',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (!Array.isArray(value)) {
            return false;
          } else {
            if (value.length === 0) {
              return false;
            }

            const trimmedValues = value.map((a: any) => a.toString().trim());
            return trimmedValues.every((val: string) => val !== '');
          }
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} should not be an empty array or contain empty elements`;
        },
      },
    });
  };
}
