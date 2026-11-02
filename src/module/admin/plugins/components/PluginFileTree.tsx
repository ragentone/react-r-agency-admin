import { Alert, AlertTitle } from '@ui/shad-cn/components/alert.tsx';
import { Button } from '@ui/shad-cn/components/button.tsx';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@ui/shad-cn/components/collapsible.tsx';
import { Skeleton } from '@ui/shad-cn/components/skeleton.tsx';
import { ChevronRight, File, Folder, FolderOpen } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { PluginApi } from '../api';
import type { IPluginFileItem } from '../types';

interface IPluginFileTreeProps {
  pluginId: string;
  /** Change it to reload the list, e.g. after a file was created. */
  reloadKey?: number;
  /** Called with the path of a file the admin wants to edit. */
  onOpenFile: (path: string) => void;
}

interface ITreeNode {
  name: string;
  path: string;
  /** Set for files. */
  file?: IPluginFileItem;
  children: Map<string, ITreeNode>;
}

/** Nested tree from the flat file list. */
export const buildTree = (files: IPluginFileItem[]): ITreeNode => {
  const root: ITreeNode = { name: '', path: '', children: new Map() };
  for (const file of files) {
    let node = root;
    const parts = file.path.split('/');
    parts.forEach((part, index) => {
      const path = parts.slice(0, index + 1).join('/');
      let child = node.children.get(part);
      if (!child) {
        child = { name: part, path, children: new Map() };
        node.children.set(part, child);
      }
      if (index === parts.length - 1) child.file = file;
      node = child;
    });
  }
  return root;
};

/** Folders first, then files, each alphabetically. */
const sortedChildren = (node: ITreeNode): ITreeNode[] =>
  [...node.children.values()].sort((a, b) => {
    const aFolder = a.file === undefined ? 0 : 1;
    const bFolder = b.file === undefined ? 0 : 1;
    if (aFolder !== bFolder) return aFolder - bFolder;
    return a.name.localeCompare(b.name);
  });

const INDENT = 14;

interface ITreeLevelProps {
  nodes: ITreeNode[];
  depth: number;
  onOpenFile: (path: string) => void;
}

/** One level of the tree. Folders are collapsible, files open the editor. */
const TreeLevel: React.FC<ITreeLevelProps> = ({ nodes, depth, onOpenFile }) => (
  <ul className="flex flex-col">
    {nodes.map(node =>
      node.file ? (
        <li key={node.path}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenFile(node.path)}
            style={{ paddingLeft: `${depth * INDENT + 32}px` }}
            className="h-auto w-full justify-start rounded-md py-2 pr-3 font-mono text-caption font-normal focus-visible:ring-1 focus-visible:ring-inset"
            title={node.path}
          >
            <File className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <span className="truncate">{node.name}</span>
          </Button>
        </li>
      ) : (
        <li key={node.path}>
          <TreeFolder node={node} depth={depth} onOpenFile={onOpenFile} />
        </li>
      )
    )}
  </ul>
);

interface ITreeFolderProps {
  node: ITreeNode;
  depth: number;
  onOpenFile: (path: string) => void;
}

/** Folder row with its content; folders start closed. */
const TreeFolder: React.FC<ITreeFolderProps> = ({ node, depth, onOpenFile }) => {
  const [open, setOpen] = useState(false);
  return (
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
        <span className="truncate">{node.name}</span>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <TreeLevel nodes={sortedChildren(node)} depth={depth + 1} onOpenFile={onOpenFile} />
      </CollapsibleContent>
    </Collapsible>
  );
};

/** Source files of a development project as a collapsible tree. A click on a file opens it in the editor. */
export const PluginFileTree: React.FC<IPluginFileTreeProps> = ({
  pluginId,
  reloadKey = 0,
  onOpenFile,
}) => {
  const { t } = useTranslation('admin');
  const [files, setFiles] = useState<IPluginFileItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const root = useMemo(() => buildTree(files ?? []), [files]);

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
  }, [pluginId, reloadKey]);

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
      className="rounded-4xl border border-border px-2 py-4"
    >
      <TreeLevel nodes={sortedChildren(root)} depth={0} onOpenFile={onOpenFile} />
    </nav>
  );
};
