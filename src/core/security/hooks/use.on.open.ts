import { useState } from 'react';

/**
 * Runs `onOpen` while rendering when `open` turns true – resets a drawer's form state without
 * a `useEffect` (React: "adjusting state when a prop changes").
 */
export const useOnOpen = (open: boolean, onOpen: () => void) => {
  const [previous, setPrevious] = useState(open);
  if (open !== previous) {
    setPrevious(open);
    if (open) onOpen();
  }
};
