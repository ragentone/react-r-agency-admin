import { useGraphQl, useGraphQlGetter } from '@core/mesh';
import { useCallback, useState } from 'react';

import {
  FileShareCreateMutation,
  FileShareDeleteMutation,
  FileShareLinkCreateMutation,
  FileShareLinkRevokeMutation,
  FileShareListQuery,
  FileShareUpdateMutation,
} from '../graphql';
import type { IFileShareItem, IFileShareValues, IFileShareWriteResult } from '../types';

type GraphQlClient = ReturnType<typeof useGraphQl>;
type QueryDocument = Parameters<GraphQlClient['query']>[0]['query'];
type MutationDocument = Parameters<GraphQlClient['mutate']>[0]['mutation'];

const toError = (err: unknown) => (err instanceof Error ? err : new Error(String(err)));

/** Known backend errors → translation keys (`file-share:error.*`). */
const ERROR_KEYS: [needle: string, key: string][] = [
  ['file_share_file_too_large', 'error.tooLarge'],
  ['file_type_not_allowed', 'error.type'],
  ['not_allowed', 'error.type'],
  ['not_authorized', 'error.notAuthorized'],
  ['file_share_not_found', 'error.notFound'],
];

const errorKey = (errors: unknown, fallback: string): string => {
  const text = JSON.stringify(errors ?? '');
  return ERROR_KEYS.find(([needle]) => text.includes(needle))?.[1] ?? fallback;
};

const sortByDate = (files: IFileShareItem[]) =>
  [...files].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

interface IMutationResponse<T> {
  data?: Record<string, { success?: boolean } & T>;
  errors?: unknown;
}

/** Download area: list (everyone) + create / update / delete (`admin:user`). */
export const useFileShare = () => {
  const getGraphql = useGraphQlGetter();
  const [files, setFiles] = useState<IFileShareItem[]>([]);
  /** Files a guest can't see (only signed-in users). */
  const [restricted, setRestricted] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = (await getGraphql().query({
        query: FileShareListQuery as QueryDocument,
        fetchPolicy: 'no-cache',
      })) as {
        data?: {
          fileShareList?: { success?: boolean; files?: IFileShareItem[]; restricted?: number };
        };
      };
      const result = response.data?.fileShareList;
      if (!result?.success) throw new Error('fileShareList failed');
      setFiles(sortByDate(result.files ?? []));
      setRestricted(result.restricted ?? 0);
    } catch (err) {
      setError(toError(err));
    } finally {
      setLoading(false);
      setLoaded(true);
    }
  }, [getGraphql]);

  const write = useCallback(
    async (
      document: unknown,
      field: string,
      variables: Record<string, unknown>,
      apply: (file: IFileShareItem | undefined) => void
    ): Promise<IFileShareWriteResult> => {
      setSaving(true);
      try {
        const response = (await getGraphql().mutate({
          mutation: document as MutationDocument,
          variables,
          errorPolicy: 'all',
        })) as IMutationResponse<{ file?: IFileShareItem }>;
        const result = response.data?.[field];
        if (!result?.success) return { ok: false, error: errorKey(response.errors, 'error.save') };
        apply(result.file);
        return { ok: true };
      } catch (err) {
        return { ok: false, error: errorKey(err, 'error.save') };
      } finally {
        setSaving(false);
      }
    },
    [getGraphql]
  );

  const create = useCallback(
    (values: IFileShareValues, file: File) =>
      write(FileShareCreateMutation, 'fileShareCreate', { values, file: [file] }, item => {
        if (item) setFiles(prev => sortByDate([item, ...prev]));
      }),
    [write]
  );

  /** `file` = replace the stored file. */
  const update = useCallback(
    (id: string, values: IFileShareValues, file: File | null) =>
      write(
        FileShareUpdateMutation,
        'fileShareUpdate',
        { id, values, file: file ? [file] : null },
        item => {
          if (item) setFiles(prev => prev.map(entry => (entry.id === id ? item : entry)));
        }
      ),
    [write]
  );

  const remove = useCallback(
    (id: string) =>
      write(FileShareDeleteMutation, 'fileShareDelete', { id }, () =>
        setFiles(prev => prev.filter(entry => entry.id !== id))
      ),
    [write]
  );

  const replace = (id: string) => (item: IFileShareItem | undefined) => {
    if (item) setFiles(prev => prev.map(entry => (entry.id === id ? item : entry)));
  };

  /** New share link – an existing link stops working. */
  const createLink = useCallback(
    (id: string) => write(FileShareLinkCreateMutation, 'fileShareLinkCreate', { id }, replace(id)),
    [write]
  );

  const revokeLink = useCallback(
    (id: string) => write(FileShareLinkRevokeMutation, 'fileShareLinkRevoke', { id }, replace(id)),
    [write]
  );

  return {
    files,
    restricted,
    loading,
    loaded,
    saving,
    error,
    load,
    create,
    update,
    remove,
    createLink,
    revokeLink,
  };
};
