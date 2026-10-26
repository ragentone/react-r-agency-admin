import { cn } from '@ui/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@ui/shad-cn/components/table';
import React from 'react';

import { parseMarkdownBlocks, renderInlineMarkdown } from './markdown';

export interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className }) => {
  const blocks = React.useMemo(() => parseMarkdownBlocks(content), [content]);

  return (
    <div className={cn('space-y-2.5 text-sm leading-relaxed', className)}>
      {blocks.map((block, index) => {
        if (block.type === 'table' && block.table) {
          const { headers, alignments, rows } = block.table;
          const alignClass = (align: 'left' | 'center' | 'right' | undefined) => {
            if (align === 'center') return 'text-center';
            if (align === 'right') return 'text-right';
            return 'text-left';
          };

          return (
            <div key={index} className="my-3 overflow-hidden rounded-lg border border-border/80 shadow-xs">
              <Table>
                <TableHeader className="bg-muted/60">
                  <TableRow>
                    {headers.map((header, hIdx) => (
                      <TableHead
                        key={hIdx}
                        className={cn(
                          'font-semibold text-xs sm:text-sm text-foreground py-2 px-3',
                          alignClass(alignments[hIdx])
                        )}
                      >
                        {renderInlineMarkdown(header)}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row, rIdx) => (
                    <TableRow key={rIdx} className={cn(rIdx % 2 === 1 && 'bg-muted/20')}>
                      {row.map((cell, cIdx) => (
                        <TableCell
                          key={cIdx}
                          className={cn('py-2 px-3 text-xs sm:text-sm', alignClass(alignments[cIdx]))}
                        >
                          {renderInlineMarkdown(cell)}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          );
        }

        if (block.type === 'heading') {
          const Tag = (`h${Math.min(Math.max(block.level || 1, 1), 6)}` as keyof React.JSX.IntrinsicElements);
          const headingStyles: Record<number, string> = {
            1: 'text-base sm:text-lg font-bold text-foreground mt-3 mb-1.5 pb-1 border-b border-border/40',
            2: 'text-sm sm:text-base font-bold text-foreground mt-2.5 mb-1',
            3: 'text-sm font-semibold text-foreground mt-2 mb-1',
            4: 'text-xs sm:text-sm font-semibold text-foreground mt-1.5 mb-0.5',
            5: 'text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-1 mb-0.5',
            6: 'text-xs font-medium text-muted-foreground mt-1 mb-0.5',
          };

          return (
            <Tag key={index} className={headingStyles[block.level || 1] || headingStyles[3]}>
              {renderInlineMarkdown(block.content || '')}
            </Tag>
          );
        }

        if (block.type === 'list') {
          const ListTag = block.ordered ? 'ol' : 'ul';
          return (
            <ListTag
              key={index}
              className={cn(
                'my-2 space-y-1 pl-5',
                block.ordered ? 'list-decimal list-outside' : 'list-disc list-outside marker:text-primary/70'
              )}
            >
              {block.items?.map((item, itemIdx) => (
                <li key={itemIdx} className="leading-relaxed">
                  {renderInlineMarkdown(item)}
                </li>
              ))}
            </ListTag>
          );
        }

        if (block.type === 'quote') {
          return (
            <blockquote
              key={index}
              className="my-2 border-l-2 border-primary/50 bg-muted/30 py-1.5 px-3 rounded-r text-muted-foreground italic text-xs sm:text-sm"
            >
              {renderInlineMarkdown(block.content || '')}
            </blockquote>
          );
        }

        if (block.type === 'hr') {
          return <hr key={index} className="my-3 border-border/60" />;
        }

        // Paragraph
        return (
          <p key={index} className="whitespace-pre-wrap wrap-break-word leading-relaxed">
            {renderInlineMarkdown(block.content || '')}
          </p>
        );
      })}
    </div>
  );
};
