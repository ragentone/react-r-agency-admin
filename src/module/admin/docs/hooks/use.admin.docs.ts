import { useEffect, useState } from 'react';

import { AdminDocsApi } from '../api';
import type { IAdminDoc } from '../types';

interface IState {
  docs: IAdminDoc[];
  loading: boolean;
  error: boolean;
}

/** The runtime docs, loaded on mount; `reload` retries after an error. */
export const useAdminDocs = () => {
  const [tick, setTick] = useState(0);
  const [state, setState] = useState<IState>({ docs: [], loading: true, error: false });

  useEffect(() => {
    let cancelled = false;
    setState(previous => ({ ...previous, loading: true, error: false }));
    void AdminDocsApi.list().then(result => {
      if (cancelled) return;
      setState({ docs: result.docs, loading: false, error: !result.success });
    });
    return () => {
      cancelled = true;
    };
  }, [tick]);

  return { ...state, reload: () => setTick(value => value + 1) };
};
