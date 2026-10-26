import { useCallback, useState } from 'react';

import { SEARCH_RECENT_MAX, SEARCH_STORAGE_RECENT } from '../const';

const read = (): string[] => {
  try {
    const parsed = JSON.parse(localStorage.getItem(SEARCH_STORAGE_RECENT) ?? '[]');
    return Array.isArray(parsed) ? parsed.filter(item => typeof item === 'string') : [];
  } catch {
    return [];
  }
};

const write = (items: string[]) => {
  try {
    localStorage.setItem(SEARCH_STORAGE_RECENT, JSON.stringify(items));
  } catch {
    /* private mode */
  }
};

/** Recent search terms (per browser, newest first). */
export const useRecentSearches = () => {
  const [items, setItems] = useState<string[]>(read);

  const add = useCallback((term: string) => {
    const value = term.trim();
    if (!value) return;
    setItems(prev => {
      const next = [
        value,
        ...prev.filter(item => item.toLowerCase() !== value.toLowerCase()),
      ].slice(0, SEARCH_RECENT_MAX);
      write(next);
      return next;
    });
  }, []);

  const remove = useCallback((term: string) => {
    setItems(prev => {
      const next = prev.filter(item => item !== term);
      write(next);
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setItems([]);
    write([]);
  }, []);

  return { items, add, remove, clear };
};
