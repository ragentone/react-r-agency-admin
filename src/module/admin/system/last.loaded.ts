/** Last loaded result per key. A remounted tab shows it at once and refreshes in place. */
const lastLoaded = new Map<string, unknown>();

export const readLast = <T>(key: string): T | undefined => lastLoaded.get(key) as T | undefined;

export const rememberLast = (key: string, value: unknown): void => {
  lastLoaded.set(key, value);
};
