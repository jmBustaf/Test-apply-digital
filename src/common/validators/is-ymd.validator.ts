import { registerDecorator, ValidationOptions } from 'class-validator';

export function IsYMD(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'IsYMD',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown) {
          return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
        },
        defaultMessage: () => 'Debe tener formato YYYY-MM-DD',
      },
    });
  };
}
