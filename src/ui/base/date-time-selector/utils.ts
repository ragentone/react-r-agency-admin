export type DateTimeSelectorMode = 'date' | 'time' | 'datetime';

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Accepts Date, 'YYYY-MM-DD' (parsed as *local* date, no UTC shift) or any ISO string. */
export const toDate = (value: Date | string | null | undefined): Date | null => {
  if (!value) return null;
  if (value instanceof Date) return isNaN(value.getTime()) ? null : value;
  const iso = ISO_DATE.exec(value.trim());
  if (iso) {
    const date = new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));
    return isNaN(date.getTime()) ? null : date;
  }
  const date = new Date(value);
  return isNaN(date.getTime()) ? null : date;
};

const pad = (n: number) => String(n).padStart(2, '0');

/** Local 'YYYY-MM-DD' – what date-only backends and <input type="date"> expect. */
export const toISODateString = (date: Date): string =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

/** Full years between date and reference (birthday → age). */
export const getAge = (date: Date, reference: Date = new Date()): number => {
  let age = reference.getFullYear() - date.getFullYear();
  const beforeBirthday =
    reference.getMonth() < date.getMonth() ||
    (reference.getMonth() === date.getMonth() && reference.getDate() < date.getDate());
  if (beforeBirthday) age -= 1;
  return Math.max(0, age);
};
