import { Transform } from 'class-transformer';

export const ToNumber = (defaultValue?: number) =>
  Transform(
    ({ value }) => {
      if (value == null || value === '') return defaultValue;
      const n = Number(value);
      return Number.isFinite(n) ? n : defaultValue;
    },
    { toClassOnly: true },
  );
