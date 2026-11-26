import { useGraphQlGetter } from '@core/mesh';
import { useCallback } from 'react';

import { AdminPageFileUploadMutation } from '../graphql';
import { errorKey, type MutationDocument } from './graphql.client';
import type { IImageUploadResult } from './use.admin.page.image';

/** Same as the backend (`SITE_PAGE_FILE_*`). */
export const SITE_PAGE_FILE_MAX_SIZE = 20 * 1024 * 1024;
export const SITE_PAGE_FILE_ACCEPT = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.oasis.opendocument.text',
  'application/vnd.oasis.opendocument.spreadsheet',
  'text/plain',
  'text/csv',
  'application/zip',
].join(',');

/** "1,2 MB" in the editor language. */
export const formatFileSize = (bytes: number, locale: string) => {
  const units = ['B', 'KB', 'MB', 'GB'];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit++;
  }
  const digits = unit >= 2 && value < 10 ? 1 : 0;
  return `${new Intl.NumberFormat(locale, { maximumFractionDigits: digits }).format(value)} ${units[unit]}`;
};

/** Uploads one file for the downloads block (`adminPageFileUpload`). */
export const useAdminPageFileUpload = () => {
  const getGraphql = useGraphQlGetter();

  return useCallback(
    async (file: File): Promise<IImageUploadResult> => {
      if (!SITE_PAGE_FILE_ACCEPT.split(',').includes(file.type)) {
        return { ok: false, error: 'error.fileType' };
      }
      if (file.size > SITE_PAGE_FILE_MAX_SIZE) return { ok: false, error: 'error.fileTooLarge' };
      try {
        const response = (await getGraphql().mutate({
          mutation: AdminPageFileUploadMutation as MutationDocument,
          variables: { file: [file] },
          errorPolicy: 'all',
        })) as {
          data?: { adminPageFileUpload?: { success?: boolean; url?: string | null } };
          errors?: unknown;
        };
        const result = response.data?.adminPageFileUpload;
        if (!result?.success || !result.url) {
          return { ok: false, error: fileError(response.errors) };
        }
        return { ok: true, url: result.url };
      } catch (err) {
        return { ok: false, error: fileError(err) };
      }
    },
    [getGraphql]
  );
};

/** Server errors → file texts (the shared list maps them to the image texts). */
const fileError = (errors: unknown) => {
  const key = errorKey(errors, 'error.fileUpload');
  if (key === 'error.imageType') return 'error.fileType';
  if (key === 'error.imageTooLarge') return 'error.fileTooLarge';
  if (key === 'error.imageUpload') return 'error.fileUpload';
  return key;
};
