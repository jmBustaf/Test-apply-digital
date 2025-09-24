import { Transform } from 'class-transformer';

export const TrimEmptyToUndefined = () =>
  Transform(
    ({ value }) => {
      if (value == null) return undefined;
      if (typeof value !== 'string') return undefined;
      const v = value.trim();
      return v === '' ? undefined : v;
    },
    { toClassOnly: true },
  );
