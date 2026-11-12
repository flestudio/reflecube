const FIRST_DATE = new Date(1900, 0, 1);

const pad = (n: number, length: number) => `${n}`.padStart(length, "0");

export const toDateString = (date: Date) => {
  const year = pad(date.getFullYear(), 4);
  const month = pad(date.getMonth() + 1, 2);
  const day = pad(date.getDate(), 2);

  return `${year}-${month}-${day}`;
};

export const isDateString = (value: string) => {
  const time = Date.parse(`${value}T00:00:00Z`);
  return !Number.isNaN(time) && new Date(time).toISOString().startsWith(value);
};

export const compact = (date: string) => date.replaceAll("-", "");

export const formatDate = (date: string) => date.replaceAll("-", "/");

export const seedOf = (date: string) => Number(compact(date));

export const parseDateParam = (param: string | null, today: string) => {
  const date = (param ?? "").replace(/^(\d{4})(\d{2})(\d{2})$/, "$1-$2-$3");
  return isDateString(date) && date <= today ? date : today;
};

export const randomDate = (fraction: number, today: Date) => {
  const span = today.getTime() - FIRST_DATE.getTime();
  return toDateString(new Date(FIRST_DATE.getTime() + fraction * span));
};

export const formatElapsed = (milliseconds: number) => {
  const seconds = Math.floor(milliseconds / 1000);
  return `${pad(Math.floor(seconds / 60), 2)}:${pad(seconds % 60, 2)}`;
};

export const shareText = (date: string, elapsed: number, origin: string) => {
  return [
    `⬛🟨⬛ RefleCube ${formatDate(date)}`,
    `🟨⬜🟦 ${origin}/?date=${compact(date)}`,
    `⬛🟦⬛ Solved in ${formatElapsed(elapsed)}`,
  ].join("\n");
};
