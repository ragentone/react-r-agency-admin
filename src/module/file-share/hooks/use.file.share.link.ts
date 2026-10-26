import { useGraphQl, useGraphQlGetter } from '@core/mesh';
import { useCallback, useState } from 'react';

import { FileShareLinkResolveQuery } from '../graphql';
import type { IFileShareItem } from '../types';

type GraphQlClient = ReturnType<typeof useGraphQl>;
type QueryDocument = Parameters<GraphQlClient['query']>[0]['query'];

export type FileShareLinkStatus = 'idle' | 'loading' | 'ready' | 'invalid' | 'error';

/** Public: file behind a share link. Unknown / revoked links → `invalid`. */
export const useFileShareLink = () => {
  const getGraphql = useGraphQlGetter();
  const [file, setFile] = useState<IFileShareItem | null>(null);
  const [status, setStatus] = useState<FileShareLinkStatus>('idle');

  const load = useCallback(
    async (token: string) => {
      setStatus('loading');
      try {
        const response = (await getGraphql().query({
          query: FileShareLinkResolveQuery as QueryDocument,
          variables: { token },
          fetchPolicy: 'no-cache',
          errorPolicy: 'all',
        })) as {
          data?: { fileShareLinkResolve?: { success?: boolean; file?: IFileShareItem | null } };
          errors?: unknown;
        };
        const result = response.data?.fileShareLinkResolve;
        if (result?.success && result.file) {
          setFile(result.file);
          setStatus('ready');
        } else {
          setFile(null);
          // Answer without data at all → network / server problem, not a bad link.
          setStatus(result ? 'invalid' : 'error');
        }
      } catch {
        setFile(null);
        setStatus('error');
      }
    },
    [getGraphql]
  );

  return { file, status, load };
};
