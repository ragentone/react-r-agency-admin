import { Badge } from '@ui/shad-cn/components/badge.tsx';
import { Button } from '@ui/shad-cn/components/button.tsx';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@ui/shad-cn/components/collapsible.tsx';
import { Skeleton } from '@ui/shad-cn/components/skeleton.tsx';
import { ChevronRight, File, Folder, FolderOpen } from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { usePluginTables } from '../hooks/use-plugin-tables';
import type { IPluginFieldSpec, IPluginTableDefinition, PluginTableFieldType } from '../types';

const INDENT = 14;

/** A field written in the short form (`'string'`) becomes `{ type: 'string' }`. */
const specOf = (value: PluginTableFieldType | IPluginFieldSpec): IPluginFieldSpec =>
  typeof value === 'string' ? { type: value } : value;

/** Shows a default or other value as text; objects as JSON. */
const show = (value: unknown): string => (typeof value === 'object' && value !== null ? JSON.stringify(value) : String(value));

interface ITreeFolderProps {
  label: string;
  count: number;
  depth: number;
  children: React.ReactNode;
}

/** Folder row (table or column). Starts closed and shows how many entries it holds. */
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
  label: string;
  value: string;
  depth: number;
}

/** Leaf of the tree: one setting, e.g. the type of a column. */
const ConfigRow: React.FC<IConfigRowProps> = ({ label, value, depth }) => (
  <li
    className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-md py-2 pr-3 text-caption"
    style={{ paddingLeft: `${depth * INDENT + 32}px` }}
  >
    <File className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
    <span className="text-muted-foreground">{label}</span>
    <Badge variant="outline" className="font-mono">{value}</Badge>
  </li>
);

interface IFieldNodeProps {
  name: string;
  spec: IPluginFieldSpec;
  depth: number;
}

/** Column of a table. Its settings (type, required, default, from) are the configs below it. */
const FieldNode: React.FC<IFieldNodeProps> = ({ name, spec, depth }) => {
  const { t } = useTranslation('admin');
  const configs: { label: string; value: string }[] = [
    { label: t('plugins.repositories.keys.type'), value: spec.type },
  ];
  if (spec.required !== undefined) {
    configs.push({
      label: t('plugins.repositories.keys.required'),
      value: spec.required ? t('plugins.configFields.yes') : t('plugins.configFields.no'),
    });
  }
  if (spec.default !== undefined) {
    configs.push({ label: t('plugins.repositories.keys.default'), value: show(spec.default) });
  }
  if (spec.from !== undefined) {
    configs.push({ label: t('plugins.repositories.keys.from'), value: spec.from });
  }

  return (
    <li>
      <TreeFolder label={name} count={configs.length} depth={depth}>
        <ul className="flex flex-col">
          {configs.map(config => (
            <ConfigRow key={config.label} label={config.label} value={config.value} depth={depth + 1} />
          ))}
        </ul>
      </TreeFolder>
    </li>
  );
};

interface ITableNodeProps {
  table: IPluginTableDefinition;
  depth: number;
}

/** One table definition: its own settings (owner) first, then its columns. */
const TableNode: React.FC<ITableNodeProps> = ({ table, depth }) => {
  const { t } = useTranslation('admin');
  const fields = Object.entries(table.fields);
  return (
    <li>
      <TreeFolder label={table.name} count={fields.length} depth={depth}>
        <ul className="flex flex-col">
          <ConfigRow
            label={t('plugins.repositories.keys.owner')}
            value={table.owner ? t('plugins.configFields.yes') : t('plugins.configFields.no')}
            depth={depth + 1}
          />
          {fields.map(([name, value]) => (
            <FieldNode key={name} name={name} spec={specOf(value)} depth={depth + 1} />
          ))}
        </ul>
      </TreeFolder>
    </li>
  );
};

interface IPluginRepositoriesTreeProps {
  pluginId: string;
}

/** Table definitions of a plugin (`IPluginTableDefinition`) as a tree: table → columns → settings. */
export const PluginRepositoriesTree: React.FC<IPluginRepositoriesTreeProps> = ({ pluginId }) => {
  const { t } = useTranslation('admin');
  const { loading, error, tables, retry } = usePluginTables(pluginId);

  let body: React.ReactNode;
  if (loading) {
    body = <Skeleton className="h-24 w-full" />;
  } else if (error) {
    body = (
      <div className="flex items-center justify-between gap-2 rounded-md border border-border p-3">
        <p className="text-caption text-destructive">{t('plugins.repositories.errors.load')}</p>
        <Button variant="outline" size="md" onClick={retry}>
          {t('plugins.error.retry')}
        </Button>
      </div>
    );
  } else if (tables.length === 0) {
    body = <p className="text-caption text-muted-foreground">{t('plugins.repositories.empty')}</p>;
  } else {
    body = (
      <nav aria-label={t('plugins.repositories.title')}>
        <ul className="flex flex-col">
          {tables.map(table => (
            <TableNode key={table.name} table={table} depth={0} />
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
