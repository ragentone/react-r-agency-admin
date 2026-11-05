import { Button } from '@ui/shad-cn/components/button.tsx';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@ui/shad-cn/components/collapsible.tsx';
import {
  CodeBlock,
  CodeBlockActions,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockHeader,
  CodeBlockTitle,
} from '@ui/shad-cn/components/code-block.tsx';
import { Skeleton } from '@ui/shad-cn/components/skeleton.tsx';
import { Delayed } from '@ui/patterns';
import { ChevronRight, File, Folder, FolderOpen } from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { usePluginManifest } from '../hooks/use-plugin-manifest';

const INDENT = 14;

/** Objects and arrays are folders, everything else (string, number, boolean, null) is a leaf. */
const isContainer = (value: unknown): value is Record<string, unknown> | unknown[] =>
  typeof value === 'object' && value !== null;

/** Children of a folder: array items get their index as name. */
const entriesOf = (value: Record<string, unknown> | unknown[]): [string, unknown][] =>
  Array.isArray(value) ? value.map((item, index) => [String(index), item]) : Object.entries(value);

interface IJsonFolderProps {
  name: string;
  value: Record<string, unknown> | unknown[];
  depth: number;
}

const JsonFolder: React.FC<IJsonFolderProps> = ({ name, value, depth }) => {
  const [open, setOpen] = useState(false);
  const entries = entriesOf(value);
  return (
    <li>
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger
          render={
            <Button
              variant="ghost"
              size="sm"
              style={{ paddingLeft: `${depth * INDENT + 8}px` }}
              className="h-auto w-full justify-start rounded-md py-2 pr-3 font-mono text-caption font-bold text-foreground focus-visible:ring-1 focus-visible:ring-inset"
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
          <span className="min-w-0 flex-1 truncate text-left">{name}</span>
          <span className="shrink-0 font-normal text-muted-foreground">{entries.length}</span>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <ul className="flex flex-col">
            {entries.map(([key, child]) => (
              <JsonNode key={key} name={key} value={child} depth={depth + 1} />
            ))}
          </ul>
        </CollapsibleContent>
      </Collapsible>
    </li>
  );
};

interface IJsonLeafProps {
  name: string;
  value: unknown;
  depth: number;
}

/** A single value. Strings are shown in quotes, so they can be told apart from numbers and booleans. */
const JsonLeaf: React.FC<IJsonLeafProps> = ({ name, value, depth }) => (
  <li
    className="flex flex-wrap items-baseline gap-x-3 gap-y-1 rounded-md py-2 pr-3 text-caption"
    style={{ paddingLeft: `${depth * INDENT + 32}px` }}
  >
    <File className="size-4 shrink-0 self-center text-muted-foreground" aria-hidden="true" />
    <span className="font-mono font-bold">{name}</span>
    <span className="min-w-0 break-all font-mono text-muted-foreground">{JSON.stringify(value)}</span>
  </li>
);

interface IJsonNodeProps {
  name: string;
  value: unknown;
  depth: number;
}

const JsonNode: React.FC<IJsonNodeProps> = ({ name, value, depth }) =>
  isContainer(value) ? (
    <JsonFolder name={name} value={value} depth={depth} />
  ) : (
    <JsonLeaf name={name} value={value} depth={depth} />
  );

/** Shows plugin.json of the development project as a collapsible tree. Invalid JSON is shown as raw text. */
export const PluginManifestView: React.FC<{ pluginId: string }> = ({ pluginId }) => {
  const { t } = useTranslation('admin');
  const { loading, error, raw, parsed, retry } = usePluginManifest(pluginId);

  if (loading) {
    return (
      <Delayed className="min-h-48">
        <Skeleton className="h-48 w-full" />
      </Delayed>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-between gap-2 rounded-md border border-border p-3">
        <p className="text-caption text-destructive">{t('plugins.error.title')}</p>
        <Button variant="outline" size="md" onClick={retry}>
          {t('plugins.error.retry')}
        </Button>
      </div>
    );
  }

  if (!parsed || !parsed.valid) {
    return (
      <CodeBlock>
        <CodeBlockHeader>
          <CodeBlockTitle>plugin.json</CodeBlockTitle>
          <CodeBlockActions>
            <CodeBlockCopyButton value={raw} />
          </CodeBlockActions>
        </CodeBlockHeader>
        <CodeBlockContent>{raw}</CodeBlockContent>
      </CodeBlock>
    );
  }

  const value = parsed.value;
  return (
    <nav aria-label="plugin.json">
      <ul className="flex flex-col">
        {isContainer(value) ? (
          entriesOf(value).map(([key, child]) => (
            <JsonNode key={key} name={key} value={child} depth={0} />
          ))
        ) : (
          <JsonNode name="plugin.json" value={value} depth={0} />
        )}
      </ul>
    </nav>
  );
};
