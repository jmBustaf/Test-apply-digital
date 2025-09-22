import { Transform } from 'class-transformer';

export const ToInt = (defaultValue?: number) =>
  Transform(
    ({ value }) => {
      if (value == null || value === '') return defaultValue;
      const n = Number(value);
      return Number.isFinite(n) ? Math.trunc(n) : defaultValue;
    },
    { toClassOnly: true },
  );
