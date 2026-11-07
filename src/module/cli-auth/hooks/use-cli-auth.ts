import { useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

import { type CliVerifyError, verifyCliLogin } from '../api';
import { CLI_AUTH_SUCCESS_ROUTE } from '../const';

export type CliAuthStatus = 'idle' | 'pending' | 'done' | 'error';

/** Kurze Bestätigung sichtbar lassen, dann zur Erfolgsseite. */
const REDIRECT_DELAY_MS = 800;

export const useCliAuth = (code: string) => {
  const navigate = useNavigate();
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

  useEffect(() => {
    if (status !== 'done') return;
    const timer = window.setTimeout(() => navigate({ to: CLI_AUTH_SUCCESS_ROUTE }), REDIRECT_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [status, navigate]);

  return { status, error, submit };
};
