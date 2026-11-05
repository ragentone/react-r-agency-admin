import { Badge } from '@ui/shad-cn/components/badge.tsx';
import { Button } from '@ui/shad-cn/components/button.tsx';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@ui/shad-cn/components/collapsible.tsx';
import { ChevronRight, File, Folder, FolderOpen } from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { IPluginRepository, IPluginRepositoryColumn, IPluginRepositoryConfig } from '../types';

const INDENT = 14;

interface ITreeFolderProps {
  label: string;
  count: number;
  depth: number;
  children: React.ReactNode;
}

/** Folder row (repository or column). Starts closed and shows how many entries it holds. */
const TreeFolder: React.FC<ITreeFolderProps> = ({ label, count, depth, children }) => {
  const [open, setOpen] = useState(false);
  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger
        render={
          <Button
            variant="ghost"
            size="sm"
            style={{ paddingLeft: `${depth * INDENT + 8}px` }}
            className="h-auto w-full justify-start rounded-md py-2 pr-3 text-body font-bold text-foreground focus-visible:ring-1 focus-visible:ring-inset"
          />
        }
      >
        <ChevronRight
          className={`size-4 shrink-0 text-muted-foreground transition-transform ${open ? 'rotate-90' : ''}`}
          aria-hidden="true"
        />
        {open ? (
          <FolderOpen className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        ) : (
          <Folder className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        )}
        <span className="min-w-0 flex-1 truncate text-left">{label}</span>
        <span className="shrink-0 font-mono text-caption font-normal text-muted-foreground">{count}</span>
      </CollapsibleTrigger>
      <CollapsibleContent>{children}</CollapsibleContent>
    </Collapsible>
  );
};

interface IConfigRowProps {
  config: IPluginRepositoryConfig;
  depth: number;
}

/** Leaf of the tree: one configuration entry with its type, required flag and default. */
const ConfigRow: React.FC<IConfigRowProps> = ({ config, depth }) => {
  const { t } = useTranslation('admin');
  const hasDefault = config.default !== undefined && config.default !== null;
  return (
    <li
      className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-md py-2 pr-3 text-caption"
      style={{ paddingLeft: `${depth * INDENT + 32}px` }}
    >
      <File className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      <span className="font-mono font-bold">{config.key}</span>
      <Badge variant="outline" className="font-mono">{config.type}</Badge>
      {config.required && (
        <span className="text-muted-foreground">{t('plugins.repositories.required')}</span>
      )}
      {hasDefault && (
        <span className="font-mono text-muted-foreground">= {String(config.default)}</span>
      )}
    </li>
  );
};

interface IColumnNodeProps {
  column: IPluginRepositoryColumn;
  depth: number;
}

const ColumnNode: React.FC<IColumnNodeProps> = ({ column, depth }) => (
  <li>
    <TreeFolder label={column.name} count={column.configs.length} depth={depth}>
      <ul className="flex flex-col">
        {column.configs.map(config => (
          <ConfigRow key={config.key} config={config} depth={depth + 1} />
        ))}
      </ul>
    </TreeFolder>
  </li>
);

interface IPluginRepositoriesTreeProps {
  repositories: IPluginRepository[];
}

/** Repositories as a collapsible tree: repository → columns → configuration entries. */
export const PluginRepositoriesTree: React.FC<IPluginRepositoriesTreeProps> = ({ repositories }) => {
  const { t } = useTranslation('admin');

  let body: React.ReactNode;
  if (repositories.length === 0) {
    body = <p className="text-caption text-muted-foreground">{t('plugins.repositories.empty')}</p>;
  } else {
    body = (
      <nav aria-label={t('plugins.repositories.title')}>
        <ul className="flex flex-col">
          {repositories.map(repository => (
            <li key={repository.name}>
              <TreeFolder label={repository.name} count={repository.columns.length} depth={0}>
                <ul className="flex flex-col">
                  {repository.columns.map(column => (
                    <ColumnNode key={column.name} column={column} depth={1} />
                  ))}
                </ul>
              </TreeFolder>
            </li>
          ))}
        </ul>
      </nav>
    );
  }

  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-body font-bold">{t('plugins.repositories.title')}</h2>
      {body}
    </section>
  );
};
