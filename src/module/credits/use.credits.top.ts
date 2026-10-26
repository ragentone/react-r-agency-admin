import { useCallback, useState } from 'react';

import { creditsAction } from './api.ts';
import type { ICreditTopResult, ICreditTopUser } from './types.ts';

/** Refresh while the page is open (the runtime caches for a minute). */
export const CREDITS_TOP_REFRESH_MS = 60_000;

/** Public leaderboard – call `load()` from the component (on connect / interval). */
export const useCreditsTop = () => {
  const [users, setUsers] = useState<ICreditTopUser[] | null>(null);
  const [failed, setFailed] = useState(false);

  const load = useCallback(async () => {
    const result = await creditsAction<ICreditTopResult>('top', { limit: 3 });
    if (result.success) {
      setUsers(result.users ?? []);
      setFailed(false);
    } else setFailed(true);
  }, []);

  return { users, failed, load };
};
