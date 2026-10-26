import { useCallback, useState } from 'react';

/**
 * Hook to imperatively throw errors to the nearest ErrorBoundary
 * or handle error reset logic within components.
 */
export function useErrorBoundary() {
  const [, setError] = useState<unknown>(null);

  const showBoundary = useCallback((error: unknown) => {
    setError(() => {
      throw error instanceof Error ? error : new Error(String(error));
    });
  }, []);

  return { showBoundary };
}
