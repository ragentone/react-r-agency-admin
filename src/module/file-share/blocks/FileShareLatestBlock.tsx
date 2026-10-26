import type { IPageBlockRenderProps, PageBlockData } from '@core/blocks/types.ts';
import { useGraphQlGetter } from '@core/mesh';
import { Link } from '@tanstack/react-router';
import { Skeleton } from '@ui/shad-cn/components/skeleton.tsx';
import { ArrowRight, Download, Lock } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { FileKindIcon } from '../components/FileKindIcon';
import { FILE_SHARE_ROUTE } from '../const';
import { FileShareListQuery } from '../graphql';
import type { IFileShareItem } from '../types';
import { formatBytes, formatDate } from '../utils';

/** Settings of the site page block `file-share:latest` (same keys as runtime apps/file-share). */
export interface IFileShareLatestBlockData extends PageBlockData {
  title: string;
  limit: '5' | '3' | '10' | '20';
  showDescription: boolean;
}

/** Newest downloads – the backend only sends the files the visitor may see. */
const FileShareLatestBlock: React.FC<IPageBlockRenderProps<IFileShareLatestBlockData>> = ({
  data,
}) => {
  const { t, i18n } = useTranslation('file-share');
  const getGraphql = useGraphQlGetter();
  const [files, setFiles] = useState<IFileShareItem[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const response = (await getGraphql().query({
          query: FileShareListQuery as never,
          fetchPolicy: 'no-cache',
        })) as { data?: { fileShareList?: { success?: boolean; files?: IFileShareItem[] } } };
        const result = response.data?.fileShareList;
        if (!alive) return;
        if (!result?.success) throw new Error('fileShareList failed');
        setFiles(result.files ?? []);
      } catch {
        if (alive) setFailed(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, [getGraphql]);

  const limit = Number(data.limit) || 5;
  const visible = (files ?? [])
    .slice()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, limit);

  return (
    <section>
      <h2 className="mb-4 text-xl font-bold tracking-tight">
        {data.title || t('block.latest.defaultTitle')}
      </h2>
      {failed ? (
        <p className="text-body text-muted-foreground">{t('error.load')}</p>
      ) : files === null ? (
        <div className="space-y-2" aria-busy="true">
          {Array.from({ length: Math.min(limit, 4) }, (_, i) => (
            <Skeleton key={i} className="h-16 rounded-2xl" />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <p className="text-body text-muted-foreground">{t('block.latest.empty')}</p>
      ) : (
        <ul className="divide-y divide-border/60 rounded-2xl border border-border/60">
          {visible.map(file => (
            <li key={file.id} className="flex items-center gap-3 p-3">
              <FileKindIcon
                mimeType={file.mimeType}
                extension={file.extension}
                className="size-11 shrink-0 rounded-xl"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{file.title}</p>
                {data.showDescription && file.description && (
                  <p className="line-clamp-2 text-caption text-muted-foreground">
                    {file.description}
                  </p>
                )}
                <p className="text-[11px] text-muted-foreground tabular-nums">
                  {file.extension.toUpperCase()} · {formatBytes(file.size, i18n.language)} ·{' '}
                  {formatDate(file.createdAt, i18n.language)}
                </p>
              </div>
              {file.url ? (
                <a
                  href={file.url}
                  download={file.fileName}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={t('block.latest.download', { title: file.title })}
                  className="grid size-11 shrink-0 place-items-center rounded-full bg-foreground text-background transition-opacity hover:opacity-85"
                >
                  <Download className="size-4" aria-hidden="true" />
                </a>
              ) : (
                <span
                  className="grid size-11 shrink-0 place-items-center rounded-full bg-foreground/[0.07] text-muted-foreground"
                  title={t('block.latest.locked')}
                >
                  <Lock className="size-4" aria-hidden="true" />
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
      <Link
        to={FILE_SHARE_ROUTE}
        className="mt-4 inline-flex h-11 items-center gap-2 rounded-full border border-border/70 px-5 text-body font-bold transition-colors hover:bg-foreground/[0.04]"
      >
        {t('block.latest.more')}
        <ArrowRight className="size-4" aria-hidden="true" />
      </Link>
    </section>
  );
};

export default FileShareLatestBlock;
