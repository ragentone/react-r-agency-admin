import { Skeleton } from '@ui/shad-cn/components/skeleton.tsx';
import { Alert, AlertTitle } from '@ui/shad-cn/components/alert.tsx';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { PluginApi } from '../api';
import type { IPluginFileItem } from '../types';

interface IPluginFileTreeProps {
  pluginId: string;
  /** Called with the path of a file the admin wants to edit. */
  onOpenFile: (path: string) => void;
}

interface ITreeRow {
  key: string;
  depth: number;
  label: string;
  /** Set for files, `undefined` for folders. */
  path?: string;
}

/** Flat list of folder and file rows in tree order (folders appear before their files). */
export const treeRows = (files: IPluginFileItem[]): ITreeRow[] => {
  const rows: ITreeRow[] = [];
  const seenFolders = new Set<string>();
  for (const file of files) {
    const parts = file.path.split('/');
    parts.slice(0, -1).forEach((part, index) => {
      const folder = parts.slice(0, index + 1).join('/');
      if (seenFolders.has(folder)) return;
      seenFolders.add(folder);
      rows.push({ key: `dir:${folder}`, depth: index, label: part });
    });
    rows.push({
      key: `file:${file.path}`,
      depth: parts.length - 1,
      label: parts[parts.length - 1],
      path: file.path,
    });
  }
  return rows;
};

/** Source files of a development project as tree. A click on a file opens it in the editor. */
export const PluginFileTree: React.FC<IPluginFileTreeProps> = ({ pluginId, onOpenFile }) => {
  const { t } = useTranslation('admin');
  const [files, setFiles] = useState<IPluginFileItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const rows = useMemo(() => treeRows(files ?? []), [files]);

  useEffect(() => {
    let active = true;
    setFiles(null);
    setError(null);
    void PluginApi.files(pluginId).then(result => {
      if (!active) return;
      if (result.success) setFiles(result.files ?? []);
      else setError(result.error ?? 'unknown');
    });
    return () => {
      active = false;
    };
  }, [pluginId]);

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>
          {t(`plugins.code.errors.${error}`, { defaultValue: t('plugins.code.errors.unknown') })}
        </AlertTitle>
      </Alert>
    );
  }

  if (files === null) {
    return (
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    );
  }

  return (
    <nav
      aria-label={t('plugins.code.files')}
      className="flex max-h-96 flex-col overflow-y-auto border border-border py-1"
    >
      {rows.map(row =>
        row.path ? (
          <button
            key={row.key}
            type="button"
            onClick={() => onOpenFile(row.path as string)}
            style={{ paddingLeft: `${row.depth * 16 + 12}px` }}
            className="truncate py-2 pr-3 text-left font-mono text-caption transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            {row.label}
          </button>
        ) : (
          <span
            key={row.key}
            style={{ paddingLeft: `${row.depth * 16 + 12}px` }}
            className="truncate py-2 pr-3 font-mono text-caption font-bold text-muted-foreground"
          >
            {row.label}/
          </span>
        )
      )}
    </nav>
  );
};
