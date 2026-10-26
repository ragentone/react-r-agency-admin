import type { FILE_SHARE_VISIBILITIES } from './const';

export type FileShareVisibility = (typeof FILE_SHARE_VISIBILITIES)[number];

/** Shared file as sent by the backend (`IFileShareData`). */
export interface IFileShareItem {
  id: string;
  title: string;
  description: string;
  visibility: FileShareVisibility;
  /** Original file name. */
  fileName: string;
  mimeType: string;
  extension: string;
  /** Bytes. */
  size: number;
  /** Download url – only set when the caller may download the file. */
  url: string | null;
  createdAt: string;
  updatedAt: string;
  /** Share link token – only sent to admins, `null` = no link. */
  shareToken?: string | null;
  shareCreatedAt?: string | null;
}

export interface IFileShareValues {
  title: string;
  description: string;
  visibility: FileShareVisibility;
}

/** Result of a write – `error` is a translation key of the `file-share` namespace. */
export interface IFileShareWriteResult {
  ok: boolean;
  error?: string;
}

export type FileKind =
  'image' | 'video' | 'audio' | 'pdf' | 'sheet' | 'slides' | 'archive' | 'text' | 'file';
