import {
  CodeBlock,
  CodeBlockActions,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockHeader,
  CodeBlockTitle,
} from '@ui/shad-cn/components/code-block';
import React from 'react';

import type { ICodeBlockData } from './types';

/** Code snippet: plain text in a scrollable box with a copy button. Never rendered as HTML. */
export const CodeSnippetBlock: React.FC<{ data: ICodeBlockData }> = ({ data }) => (
  <CodeBlock>
    <CodeBlockHeader>
      <CodeBlockTitle>{data.title}</CodeBlockTitle>
      <CodeBlockActions>
        <CodeBlockCopyButton value={data.code} />
      </CodeBlockActions>
    </CodeBlockHeader>
    <CodeBlockContent>{data.code}</CodeBlockContent>
  </CodeBlock>
);
