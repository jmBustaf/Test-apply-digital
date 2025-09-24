import { registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator';

export function FromLteTo(
  fromProp = 'from',
  toProp = 'to',
  msg = '"from" no puede ser mayor que "to"',
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'FromLteTo',
      target: object.constructor,
      propertyName,
      constraints: [fromProp, toProp],
      options: { message: msg, ...validationOptions },
      validator: {
        validate(_value: unknown, args: ValidationArguments): boolean {
          const [fKey, tKey] = args.constraints as [string, string];
          const obj = args.object as Record<string, unknown>;

          const f = obj[fKey] as string | undefined;
          const t = obj[tKey] as string | undefined;

          if (!f || !t) return true; // si falta uno, no aplicamos
          return f <= t;
        },
        defaultMessage(): string {
          return msg;
        },
      },
    });
  };
}
