/** Hands a suggested path from the list ("quick start" chips) over to the "new entry" page. */
let pending: string | undefined;

export const setPendingSeoPath = (path?: string) => {
  pending = path;
};

/** Reads the path once – a reload of the page starts with an empty form. */
export const takePendingSeoPath = (): string | undefined => {
  const value = pending;
  pending = undefined;
  return value;
};
