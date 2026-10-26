import { useCallback, useState } from 'react';

const storageKey = (id: string) => `menu:group:${id}`;

const read = (id: string): boolean | null => {
  try {
    const value = localStorage.getItem(storageKey(id));
    return value === null ? null : value === '1';
  } catch {
    return null;
  }
};

/**
 * Open state of a menu group (entry with children). Remembered per device; a group with
 * the active route inside starts open.
 */
export const useMenuGroupOpen = (id: string, containsActive: boolean) => {
  const [open, setOpenState] = useState<boolean>(() => read(id) ?? containsActive);

  const setOpen = useCallback(
    (next: boolean) => {
      setOpenState(next);
      try {
        localStorage.setItem(storageKey(id), next ? '1' : '0');
      } catch {
        /* storage blocked */
      }
    },
    [id]
  );

  return { open, toggle: () => setOpen(!open), setOpen };
};
