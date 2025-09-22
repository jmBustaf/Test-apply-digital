export const ymdToUtcStart = (ymd: string): Date => {
  const [y, m, d] = ymd.split('-').map((n) => parseInt(n, 10));
  return new Date(Date.UTC(y, m - 1, d, 0, 0, 0, 0));
};

export const ymdToUtcEndExclusive = (ymd: string): Date => {
  const dt = ymdToUtcStart(ymd);
  dt.setUTCDate(dt.getUTCDate() + 1);
  return dt;
};

export const todayUtcEndExclusive = (): Date => {
  const now = new Date();
  const today = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0),
  );
  today.setUTCDate(today.getUTCDate() + 1);
  return today;
};
