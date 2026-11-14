/** Minute des Tages (0–1439) ↔ "HH:MM" für `<input type="time">`. */
export const toTime = (minute: number | null, fallback: string): string =>
  minute === null
    ? fallback
    : `${String(Math.floor(minute / 60)).padStart(2, '0')}:${String(minute % 60).padStart(2, '0')}`;

export const fromTime = (value: string): number => {
  const [hour = '0', minute = '0'] = value.split(':');
  return Number(hour) * 60 + Number(minute);
};
