import { Button } from '@ui/shad-cn/components/button.tsx';
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
import React from 'react';
import { useTranslation } from 'react-i18next';

import { usePluginManifest } from '../hooks/use-plugin-manifest';

/** Shows plugin.json of the development project as formatted JSON, with a copy button. */
export const PluginManifestView: React.FC<{ pluginId: string }> = ({ pluginId }) => {
  const { t } = useTranslation('admin');
  const { loading, error, text, retry } = usePluginManifest(pluginId);

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

  return (
    <CodeBlock>
      <CodeBlockHeader>
        <CodeBlockTitle>plugin.json</CodeBlockTitle>
        <CodeBlockActions>
          <CodeBlockCopyButton value={text} />
        </CodeBlockActions>
      </CodeBlockHeader>
      <CodeBlockContent>{text}</CodeBlockContent>
    </CodeBlock>
  );
};
