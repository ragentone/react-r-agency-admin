import React from 'react';

// Renders inline Markdown elements: **bold**, *italic*, `inline code`, [link](url)
export function renderInlineMarkdown(text: string): React.ReactNode {
  if (!text) return null;

  // Pattern matches:
  // 1. `code`
  // 2. **bold** or __bold__
  // 3. *italic* or _italic_
  // 4. [text](url)
  const regex = /(`[^`]+`|\*\*[^*]+\*\*|__[^_]+__|\*[^*]+\*|_[^_]+_|\[([^\]]+)\]\(([^)]+)\))/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    const token = match[0];

    if (token.startsWith('`') && token.endsWith('`')) {
      parts.push(
        <code
          key={match.index}
          className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs font-medium text-foreground border border-border/60"
        >
          {token.slice(1, -1)}
        </code>
      );
    } else if (
      (token.startsWith('**') && token.endsWith('**')) ||
      (token.startsWith('__') && token.endsWith('__'))
    ) {
      parts.push(
        <strong key={match.index} className="font-semibold text-foreground">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (
      (token.startsWith('*') && token.endsWith('*')) ||
      (token.startsWith('_') && token.endsWith('_'))
    ) {
      parts.push(
        <em key={match.index} className="italic text-foreground/90">
          {token.slice(1, -1)}
        </em>
      );
    } else if (token.startsWith('[')) {
      const linkText = match[2];
      const linkUrl = match[3];
      parts.push(
        <a
          key={match.index}
          href={linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline underline-offset-2 hover:opacity-80 transition-opacity font-medium"
        >
          {linkText}
        </a>
      );
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
}

export interface MarkdownTableData {
  headers: string[];
  alignments: ('left' | 'center' | 'right')[];
  rows: string[][];
}

export interface MarkdownBlock {
  type: 'heading' | 'list' | 'quote' | 'hr' | 'paragraph' | 'table';
  level?: number;
  items?: string[];
  ordered?: boolean;
  content?: string;
  table?: MarkdownTableData;
}

// Helper to parse cells from a table row line
function parseTableRow(line: string): string[] {
  let trimmed = line.trim();
  if (trimmed.startsWith('|')) {
    trimmed = trimmed.substring(1);
  }
  if (trimmed.endsWith('|')) {
    trimmed = trimmed.substring(0, trimmed.length - 1);
  }
  return trimmed.split('|').map((c) => c.trim());
}

// Helper to check if a line is a markdown table separator (e.g. |---|:---:|---:|)
function isTableDelimiter(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed.includes('-')) return false;
  const cells = parseTableRow(trimmed);
  if (cells.length === 0) return false;
  return cells.every((cell) => /^:?-+:?$/.test(cell));
}

// Helper to parse alignment from delimiter cells
function parseAlignments(delimiterLine: string): ('left' | 'center' | 'right')[] {
  const cells = parseTableRow(delimiterLine);
  return cells.map((cell) => {
    const left = cell.startsWith(':');
    const right = cell.endsWith(':');
    if (left && right) return 'center';
    if (right) return 'right';
    return 'left';
  });
}

// Parses multiline Markdown text (headings, lists, blockquotes, horizontal rules, tables, paragraphs)
export function parseMarkdownBlocks(text: string): MarkdownBlock[] {
  if (!text) return [];

  const lines = text.split('\n');
  const blocks: MarkdownBlock[] = [];
  let currentParagraph: string[] = [];

  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      blocks.push({
        type: 'paragraph',
        content: currentParagraph.join('\n'),
      });
      currentParagraph = [];
    }
  };

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      flushParagraph();
      i++;
      continue;
    }

    // Markdown Table: header line followed by delimiter line
    if (line.includes('|') && i + 1 < lines.length && isTableDelimiter(lines[i + 1])) {
      flushParagraph();
      const headers = parseTableRow(lines[i]);
      const alignments = parseAlignments(lines[i + 1]);
      const rows: string[][] = [];

      i += 2; // Skip header and delimiter

      while (i < lines.length) {
        const rowLine = lines[i].trim();
        if (!rowLine || !rowLine.includes('|')) {
          break;
        }
        rows.push(parseTableRow(rowLine));
        i++;
      }

      blocks.push({
        type: 'table',
        table: {
          headers,
          alignments,
          rows,
        },
      });
      continue;
    }

    // Horizontal rule: --- or ***
    if (/^(?:---|\*\*\*|___)$/.test(trimmed)) {
      flushParagraph();
      blocks.push({ type: 'hr' });
      i++;
      continue;
    }

    // Headings: # H1, ## H2, ### H3, #### H4, etc.
    const headingMatch = trimmed.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      flushParagraph();
      blocks.push({
        type: 'heading',
        level: headingMatch[1].length,
        content: headingMatch[2],
      });
      i++;
      continue;
    }

    // Blockquote: > text
    if (trimmed.startsWith('>')) {
      flushParagraph();
      const quoteLines: string[] = [];
      while (i < lines.length && (lines[i].trim().startsWith('>') || (lines[i].trim() && quoteLines.length > 0 && !lines[i].trim().startsWith('#') && !lines[i].trim().startsWith('-')))) {
        if (lines[i].trim().startsWith('>')) {
          quoteLines.push(lines[i].trim().replace(/^>\s?/, ''));
        } else {
          quoteLines.push(lines[i].trim());
        }
        i++;
      }
      blocks.push({
        type: 'quote',
        content: quoteLines.join('\n'),
      });
      continue;
    }

    // Unordered list: - item or * item
    const unorderedMatch = trimmed.match(/^[-*+]\s+(.*)$/);
    if (unorderedMatch) {
      flushParagraph();
      const listItems: string[] = [];
      while (i < lines.length) {
        const itemMatch = lines[i].trim().match(/^[-*+]\s+(.*)$/);
        if (itemMatch) {
          listItems.push(itemMatch[1]);
          i++;
        } else if (lines[i].trim().startsWith('  ') && listItems.length > 0) {
          listItems[listItems.length - 1] += '\n' + lines[i].trim();
          i++;
        } else {
          break;
        }
      }
      blocks.push({
        type: 'list',
        ordered: false,
        items: listItems,
      });
      continue;
    }

    // Ordered list: 1. item
    const orderedMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
    if (orderedMatch) {
      flushParagraph();
      const listItems: string[] = [];
      while (i < lines.length) {
        const itemMatch = lines[i].trim().match(/^(\d+)\.\s+(.*)$/);
        if (itemMatch) {
          listItems.push(itemMatch[2]);
          i++;
        } else if (lines[i].trim().startsWith('  ') && listItems.length > 0) {
          listItems[listItems.length - 1] += '\n' + lines[i].trim();
          i++;
        } else {
          break;
        }
      }
      blocks.push({
        type: 'list',
        ordered: true,
        items: listItems,
      });
      continue;
    }

    // Plain text / Paragraph line
    currentParagraph.push(line);
    i++;
  }

  flushParagraph();
  return blocks;
}
