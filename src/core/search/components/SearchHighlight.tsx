import { cn } from '@ui/lib/utils';
import React from 'react';

const escape = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Marks every word of the search term in a text (case-insensitive, any order). */
export const SearchHighlight: React.FC<{ text: string; term: string; className?: string }> = ({
  text,
  term,
  className,
}) => {
  const words = [...new Set(term.trim().toLowerCase().split(/\s+/).filter(Boolean))];
  if (!words.length) return <>{text}</>;
  // Longest first, so "anna" wins over "an".
  const pattern = words
    .sort((a, b) => b.length - a.length)
    .map(escape)
    .join('|');
  const parts = text.split(new RegExp(`(${pattern})`, 'ig'));

  return (
    <>
      {parts.map((part, i) =>
        words.includes(part.toLowerCase()) ? (
          <mark key={i} className={cn('bg-transparent font-bold text-foreground', className)}>
            {part}
          </mark>
        ) : (
          <React.Fragment key={i}>{part}</React.Fragment>
        )
      )}
    </>
  );
};
