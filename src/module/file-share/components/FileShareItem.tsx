import { cn } from '@ui/lib/utils';
import { Download, EyeOff, Globe, Link2, Lock, Pencil } from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { FileShareVisibility, IFileShareItem } from '../types';
import { formatBytes, formatDate } from '../utils';
import { FileKindIcon } from './FileKindIcon';

/** Admin chip per visibility. */
const VISIBILITY_CHIP: Record<FileShareVisibility, { icon: typeof Globe; className: string }> = {
  public: { icon: Globe, className: 'bg-foreground/[0.07] text-foreground' },
  authenticated: {
    icon: Lock,
    className: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
  },
  private: {
    icon: EyeOff,
    className: 'bg-violet-500/15 text-violet-700 dark:text-violet-300',
  },
};

export interface IFileShareItemProps {
  file: IFileShareItem;
  /** `admin:user` → visibility chip + edit button. */
  manage: boolean;
  onEdit: (file: IFileShareItem) => void;
}

/** One row: icon, title, description, meta (type · size · date), download (+ edit). */
export const FileShareItem: React.FC<IFileShareItemProps> = ({ file, manage, onEdit }) => {
  const { t, i18n } = useTranslation('file-share');
  const [expanded, setExpanded] = useState(false);
  const VisibilityIcon = VISIBILITY_CHIP[file.visibility].icon;
  const longDescription = file.description.length > 140 || file.description.includes('\n');

  return (
    <li className="flex gap-3 px-4 py-3.5">
      <FileKindIcon mimeType={file.mimeType} extension={file.extension} />

      <div className="min-w-0 flex-1">
        <h3 className="text-body leading-snug font-semibold wrap-break-word text-foreground">
          {file.title}
        </h3>
        {file.description && (
          <p
            className={cn(
              'mt-0.5 text-caption wrap-break-word whitespace-pre-line text-muted-foreground',
              !expanded && 'line-clamp-2'
            )}
          >
            {file.description}
          </p>
        )}
        {file.description && longDescription && (
          <button
            type="button"
            onClick={() => setExpanded(value => !value)}
            className="mt-0.5 text-caption font-semibold text-foreground hover:underline"
          >
            {expanded ? t('item.less') : t('item.more')}
          </button>
        )}
        <div className="mt-1.5 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-muted-foreground tabular-nums">
          <span className="max-w-48 truncate" title={file.fileName}>
            {file.fileName}
          </span>
          <span aria-hidden="true">·</span>
          <span>{formatBytes(file.size, i18n.language)}</span>
          <span aria-hidden="true">·</span>
          <span>{formatDate(file.createdAt, i18n.language)}</span>
          {manage && (
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold',
                VISIBILITY_CHIP[file.visibility].className
              )}
            >
              <VisibilityIcon className="size-3" aria-hidden="true" />
              {t(`visibility.${file.visibility}.short`)}
            </span>
          )}
          {manage && file.shareToken && (
            <span className="inline-flex items-center gap-1 rounded-full bg-sky-500/15 px-2 py-0.5 font-semibold text-sky-700 dark:text-sky-300">
              <Link2 className="size-3" aria-hidden="true" />
              {t('share.chip')}
            </span>
          )}
        </div>
      </div>

      <div className="flex shrink-0 flex-col items-center gap-1 sm:flex-row">
        {file.url && (
          <a
            href={file.url}
            download={file.fileName}
            rel="noopener noreferrer"
            aria-label={t('item.download', { title: file.title })}
            className="grid size-11 place-items-center rounded-full bg-foreground text-background transition-opacity hover:opacity-85"
          >
            <Download className="size-5" aria-hidden="true" />
          </a>
        )}
        {manage && (
          <button
            type="button"
            onClick={() => onEdit(file)}
            aria-label={t('item.edit', { title: file.title })}
            className="grid size-11 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-foreground/10 hover:text-foreground"
          >
            <Pencil className="size-4.5" aria-hidden="true" />
          </button>
        )}
      </div>
    </li>
  );
};
