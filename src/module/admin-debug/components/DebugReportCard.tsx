import { cn } from '@ui/lib/utils';
import { Badge } from '@ui/shad-cn/components/badge.tsx';
import { Checkbox } from '@ui/shad-cn/components/checkbox.tsx';
import React from 'react';

import type { IDebugReport } from '../types';

interface IProps {
  item: IDebugReport;
  time: string;
  selected: boolean;
  selectLabel: string;
  onToggle: (on: boolean) => void;
  onOpen: () => void;
}

/** Mobile row of the report list (below `sm`): tap opens the detail drawer. */
export const DebugReportCard: React.FC<IProps> = ({
  item,
  time,
  selected,
  selectLabel,
  onToggle,
  onOpen,
}) => (
  <li
    data-state={selected ? 'selected' : undefined}
    tabIndex={0}
    onClick={onOpen}
    onKeyDown={event => {
      if (event.key === 'Enter') onOpen();
    }}
    className={cn(
      'flex cursor-pointer gap-3 rounded-2xl border border-border/50 p-3 transition-colors hover:bg-foreground/[0.04]',
      selected && 'bg-foreground/[0.06]'
    )}
  >
    <div className="pt-0.5" onClick={event => event.stopPropagation()}>
      <Checkbox
        checked={selected}
        onCheckedChange={value => onToggle(value === true)}
        aria-label={selectLabel}
      />
    </div>
    <div className="min-w-0 flex-1 space-y-1">
      <div className="flex flex-wrap items-center gap-2">
        <Badge
          variant={item.level === 'error' ? 'destructive' : 'outline'}
          className={item.level === 'error' ? 'text-white' : undefined}
        >
          {item.level}
        </Badge>
        <span className="text-micro text-muted-foreground">{item.source}</span>
        <span className="font-mono text-caption break-all">{item.tag}</span>
        <span className="ml-auto text-micro whitespace-nowrap text-muted-foreground">{time}</span>
      </div>
      <p className="line-clamp-2 text-body break-words">{item.message}</p>
      {item.error && (
        <p className="truncate text-caption text-muted-foreground">
          {item.error.split('\n')[0]}
        </p>
      )}
    </div>
  </li>
);
