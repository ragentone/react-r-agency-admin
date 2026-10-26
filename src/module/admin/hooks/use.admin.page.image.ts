import { useGraphQlGetter } from '@core/mesh';
import Compressor from 'compressorjs';
import { useCallback } from 'react';

import {
  AdminPageImageDiscardMutation,
  AdminPageImageKeepMutation,
  AdminPageImageUploadMutation,
} from '../graphql';
import { errorKey, type MutationDocument } from './graphql.client';

/** Same as the backend (`SITE_PAGE_IMAGE_*`). */
export const SITE_PAGE_IMAGE_MAX_SIZE = 8 * 1024 * 1024;
export const SITE_PAGE_IMAGE_ACCEPT = 'image/jpeg,image/png,image/webp,image/gif,image/avif';

/** Big photos (phone camera) → max 2400 px, JPEG / WebP re-encoded. GIFs stay untouched. */
const shrink = (file: File): Promise<File> =>
  file.type === 'image/gif' || file.size < 600 * 1024
    ? Promise.resolve(file)
    : new Promise(resolve => {
        new Compressor(file, {
          maxWidth: 2400,
          maxHeight: 2400,
          quality: 0.85,
          convertSize: 2 * 1024 * 1024,
          success: result =>
            resolve(
              result.size < file.size ? new File([result], file.name, { type: result.type }) : file
            ),
          error: () => resolve(file),
        });
      });

export interface IImageUploadResult {
  ok: boolean;
  url?: string;
  /** Translation key of the `admin` namespace. */
  error?: string;
}

/** Uploads one image for a block (`adminPageImageUpload`). */
export const useAdminPageImageUpload = () => {
  const getGraphql = useGraphQlGetter();

  return useCallback(
    async (original: File): Promise<IImageUploadResult> => {
      if (!SITE_PAGE_IMAGE_ACCEPT.split(',').includes(original.type)) {
        return { ok: false, error: 'error.imageType' };
      }
      const file = await shrink(original);
      if (file.size > SITE_PAGE_IMAGE_MAX_SIZE) return { ok: false, error: 'error.imageTooLarge' };
      try {
        const response = (await getGraphql().mutate({
          mutation: AdminPageImageUploadMutation as MutationDocument,
          variables: { file: [file] },
          errorPolicy: 'all',
        })) as {
          data?: { adminPageImageUpload?: { success?: boolean; url?: string | null } };
          errors?: unknown;
        };
        const result = response.data?.adminPageImageUpload;
        if (!result?.success || !result.url) {
          return { ok: false, error: errorKey(response.errors, 'error.imageUpload') };
        }
        return { ok: true, url: result.url };
      } catch (err) {
        return { ok: false, error: errorKey(err, 'error.imageUpload') };
      }
    },
    [getGraphql]
  );
};

/** Upload directory of a page image (`…/upload/site-page/<uuid>/…`) – null for other urls. */
export const pageImageUuid = (url: string): string | null =>
  /(?:^|\/)upload\/site-page\/([A-Za-z0-9_-]+)/.exec(url)?.[1] ?? null;

/** Same as the backend (`SITE_PAGE_IMAGE_DISCARD_MAX`). */
const IMAGE_BATCH_MAX = 50;

/**
 * Asks the server to delete uploads the editor doesn't need any more. Fire and forget: the
 * server keeps every image a page uses, and its cron catches anything missed here.
 *
 * `keepalive`: the request survives the page being closed (`pagehide`) – the browser sends it
 * even after the tab is gone. It is started synchronously for that reason.
 */
export const useAdminPageImageDiscard = () => {
  const getGraphql = useGraphQlGetter();

  return useCallback(
    (urls: string[], options?: { keepalive?: boolean }) => {
      const list = urls.filter(url => pageImageUuid(url)).slice(0, IMAGE_BATCH_MAX);
      if (!list.length) return;
      try {
        void getGraphql()
          .mutate({
            mutation: AdminPageImageDiscardMutation as MutationDocument,
            variables: { urls: list },
            errorPolicy: 'all',
            context: options?.keepalive ? { fetchOptions: { keepalive: true } } : undefined,
          })
          .catch(() => undefined);
      } catch {
        // Never disturb the editor – the cron removes what is left.
      }
    },
    [getGraphql]
  );
};

/**
 * Heartbeat of an open editor: refreshes its unsaved uploads on the server, so the cron (1 h)
 * never removes an image that is still being edited. Resolves with the urls that are gone
 * already (e.g. the device slept for hours) – empty on network errors.
 */
export const useAdminPageImageKeep = () => {
  const getGraphql = useGraphQlGetter();

  return useCallback(
    async (urls: string[]): Promise<string[]> => {
      const list = urls.filter(url => pageImageUuid(url)).slice(0, IMAGE_BATCH_MAX);
      if (!list.length) return [];
      try {
        const response = (await getGraphql().mutate({
          mutation: AdminPageImageKeepMutation as MutationDocument,
          variables: { urls: list },
          errorPolicy: 'all',
        })) as { data?: { adminPageImageKeep?: { missing?: unknown } } };
        const missing = response.data?.adminPageImageKeep?.missing;
        return Array.isArray(missing)
          ? missing.filter((url): url is string => typeof url === 'string')
          : [];
      } catch {
        return [];
      }
    },
    [getGraphql]
  );
};
