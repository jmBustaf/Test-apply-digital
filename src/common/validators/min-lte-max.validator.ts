import { registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator';

export function MinLteMax(
  minProp: string,
  maxProp: string,
  msg = '"min" debe ser <= "max"',
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'MinLteMax',
      target: object.constructor,
      propertyName,
      constraints: [minProp, maxProp],
      options: { message: msg, ...validationOptions },
      validator: {
        validate(_value: unknown, args: ValidationArguments): boolean {
          const [minKey, maxKey] = args.constraints as [string, string];
          const obj = args.object as Record<string, unknown>;

          const min = obj[minKey] as number | undefined;
          const max = obj[maxKey] as number | undefined;

          if (min == null || max == null) return true;
          return min <= max;
        },
        defaultMessage(): string {
          return msg;
        },
      },
    });
  };
}
