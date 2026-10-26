import { Link } from '@tanstack/react-router';
import { Skeleton } from '@ui/shad-cn/components/skeleton.tsx';
import { Download, FolderDown, Link2Off } from 'lucide-react';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { FILE_SHARE_ROUTE } from '../const';
import { useFileShareLink } from '../hooks';
import { formatBytes, formatDate } from '../utils';
import { FileKindIcon } from './FileKindIcon';

export interface IFileShareLinkViewProps {
  token: string;
}

/** `/files/s/<token>`: one shared file – everybody with the link may download it. */
export const FileShareLinkView: React.FC<IFileShareLinkViewProps> = ({ token }) => {
  const { t, i18n } = useTranslation('file-share');
  const { file, status, load } = useFileShareLink();

  useEffect(() => {
    void load(token);
  }, [token, load]);

  const backLink = (
    <Link
      to={FILE_SHARE_ROUTE}
      className="inline-flex h-10 items-center gap-1.5 rounded-full border border-border/60 px-4 text-sm font-bold transition-colors hover:bg-foreground/[0.06]"
    >
      <FolderDown className="size-4" aria-hidden="true" />
      {t('link.all')}
    </Link>
  );

  let body: React.ReactNode;
  if (status === 'idle' || status === 'loading') {
    body = (
      <div className="flex flex-col items-center gap-3" aria-busy="true">
        <Skeleton className="size-16 rounded-2xl" />
        <Skeleton className="h-5 w-2/3 rounded-full" />
        <Skeleton className="h-3 w-1/2 rounded-full" />
        <Skeleton className="mt-4 h-12 w-full rounded-full" />
      </div>
    );
  } else if (status === 'ready' && file) {
    body = (
      <div className="flex flex-col items-center text-center">
        <FileKindIcon
          mimeType={file.mimeType}
          extension={file.extension}
          className="size-16 rounded-2xl [&>svg]:size-7"
        />
        <p className="mt-4 text-caption font-medium text-muted-foreground">{t('link.kicker')}</p>
        <h1 className="mt-1 text-xl font-bold tracking-tight break-words text-foreground">
          {file.title}
        </h1>
        {file.description && (
          <p className="mt-2 text-body break-words whitespace-pre-line text-muted-foreground">
            {file.description}
          </p>
        )}
        <p className="mt-3 text-caption text-muted-foreground tabular-nums">
          <span className="break-all">{file.fileName}</span> ·{' '}
          {formatBytes(file.size, i18n.language)} · {formatDate(file.createdAt, i18n.language)}
        </p>
        {file.url ? (
          <a
            href={file.url}
            download={file.fileName}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground text-body font-bold text-background transition-opacity hover:opacity-85"
          >
            <Download className="size-5" aria-hidden="true" />
            {t('link.download', { size: formatBytes(file.size, i18n.language) })}
          </a>
        ) : (
          <p role="alert" className="mt-6 text-body text-destructive">
            {t('error.load')}
          </p>
        )}
      </div>
    );
  } else if (status === 'invalid') {
    body = (
      <div className="flex flex-col items-center text-center">
        <span className="grid size-14 place-items-center rounded-full bg-foreground/[0.07]">
          <Link2Off className="size-6" aria-hidden="true" />
        </span>
        <h1 className="mt-4 text-title font-bold">{t('link.invalidTitle')}</h1>
        <p className="mt-1 text-body text-muted-foreground">{t('link.invalidDescription')}</p>
        <div className="mt-6">{backLink}</div>
      </div>
    );
  } else {
    body = (
      <div role="alert" className="text-center">
        <p className="text-body text-muted-foreground">{t('error.load')}</p>
        <button
          type="button"
          onClick={() => void load(token)}
          className="mt-4 h-10 rounded-full bg-foreground px-4 text-sm font-bold text-background"
        >
          {t('retry')}
        </button>
      </div>
    );
  }

  return (
    <div
      data-slot="file-share-link"
      className="mx-auto flex min-h-dvh w-full flex-col justify-center bg-background px-4 py-10 pb-[max(2.5rem,env(safe-area-inset-bottom))]"
    >
      <div className="mx-auto w-full max-w-sm">
        <div className="rounded-3xl border border-border/60 p-6 sm:p-8">{body}</div>
        {status === 'ready' && <div className="mt-6 flex justify-center">{backLink}</div>}
      </div>
    </div>
  );
};
