import { type SetStateAction, useCallback, useState } from 'react';

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage unavailable (private mode, quota) – keep in memory only
  }
}

/** useState that optionally mirrors its value into localStorage. */
export function useStoredState<T>(key: string, fallback: T, persist = true) {
  const [value, setValue] = useState<T>(() => (persist ? read(key, fallback) : fallback));

  const update = useCallback(
    (action: SetStateAction<T>) => {
      setValue(prev => {
        const next = action instanceof Function ? action(prev) : action;
        if (persist) write(key, next);
        return next;
      });
    },
    [key, persist]
  );

  return [value, update] as const;
}
