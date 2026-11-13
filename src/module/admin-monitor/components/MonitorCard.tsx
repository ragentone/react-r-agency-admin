import { cn } from '@ui/lib/utils';
import { Card, CardContent } from '@ui/shad-cn/components/card.tsx';
import React from 'react';

/** Card with a title, one-line text and optional action – the frame of every monitor block. */
export const MonitorCard: React.FC<{
  title: string;
  text?: string;
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}> = ({ title, text, action, className, children }) => (
  <Card className="rounded-xl border-border/50 shadow-none">
    <CardContent className={cn('flex flex-col gap-3 p-4', className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-title font-bold">{title}</h3>
          {text && <p className="text-caption text-muted-foreground">{text}</p>}
        </div>
        {action}
      </div>
      {children}
    </CardContent>
  </Card>
);

/** Label / value rows separated by a thin line. */
export const MonitorFacts: React.FC<{ rows: [string, React.ReactNode][] }> = ({ rows }) => (
  <div className="flex flex-col">
    {rows.map(([label, value]) => (
      <div
        key={label}
        className="flex justify-between gap-4 border-t border-border/50 py-2 text-caption first:border-t-0"
      >
        <span className="shrink-0 text-muted-foreground">{label}</span>
        <span className="min-w-0 break-words text-right tabular-nums">{value}</span>
      </div>
    ))}
  </div>
);
