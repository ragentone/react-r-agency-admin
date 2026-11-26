import { cn } from '@ui/lib/utils';
import { ChevronRight } from 'lucide-react';
import React, { useMemo } from 'react';

import { usePageBlocks } from './blocks.context';
import type { ITocBlockData, PageBlock } from './types';

/** First heading of editor HTML (text, columns, tabs). */
const htmlHeading = (html: unknown): string => {
  if (typeof html !== 'string' || !html.includes('<h')) return '';
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.querySelector('h2, h3, h4')?.textContent?.trim() ?? '';
};

/** `unsere-preise` → `Unsere preise` – last fallback when the block has no heading. */
const fromAnchor = (anchor: string) => {
  const text = anchor.replace(/-+/g, ' ');
  return text.charAt(0).toUpperCase() + text.slice(1);
};

/** Entry text: the block's heading / title, else the first heading of its text, else the anchor. */
const entryLabel = (block: PageBlock): string => {
  const data = block.data as Record<string, unknown>;
  if (typeof data.title === 'string' && data.title.trim()) return data.title.trim();
  const items = Array.isArray(data.items) ? (data.items as Record<string, unknown>[]) : [];
  return htmlHeading(data.html) || htmlHeading(items[0]?.html) || fromAnchor(block.anchor ?? '');
};

/**
 * Table of contents: every block with an anchor (the server already removed the blocks the
 * visitor may not see). Links are plain `#anchor` jumps – the blocks keep room for the top bar.
 */
export const TocBlock: React.FC<{ data: ITocBlockData; headingClass: string }> = ({
  data,
  headingClass,
}) => {
  const { blocks } = usePageBlocks();
  const entries = useMemo(
    () =>
      blocks
        .filter(block => block.anchor && block.type !== 'toc')
        .map(block => ({ anchor: block.anchor as string, label: entryLabel(block) })),
    [blocks]
  );
  if (!entries.length) return null;
  return (
    <nav aria-label={data.title || undefined} className="rounded-2xl border border-border/50 p-2">
      {data.title && <h2 className={cn(headingClass, 'mb-1 px-3 pt-2')}>{data.title}</h2>}
      <ol>
        {entries.map((entry, index) => (
          <li key={entry.anchor}>
            <a
              href={`#${entry.anchor}`}
              className="flex min-h-11 items-center gap-3 rounded-xl px-3 py-2 text-body font-semibold transition-colors hover:bg-foreground/[0.04]"
            >
              {data.numbered && (
                <span className="w-5 shrink-0 text-caption text-muted-foreground tabular-nums">
                  {index + 1}.
                </span>
              )}
              <span className="min-w-0 flex-1">{entry.label}</span>
              <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
};
