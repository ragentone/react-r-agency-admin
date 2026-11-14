import { useState } from 'react';

import { type CliVerifyError, verifyCliLogin } from '../api';

export type CliAuthStatus = 'idle' | 'pending' | 'done' | 'error';

export const useCliAuth = (code: string) => {
  const [status, setStatus] = useState<CliAuthStatus>('idle');
  const [error, setError] = useState<CliVerifyError | null>(null);

  const submit = async (identifier: string, password: string) => {
    setStatus('pending');
    setError(null);
    const result = await verifyCliLogin(code, identifier, password);
    if (result) {
      setError(result);
      setStatus('error');
      return;
    }
    setStatus('done');
  };

  return { status, error, submit };
};
