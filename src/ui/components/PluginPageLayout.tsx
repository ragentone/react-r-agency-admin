import { useApp } from '@core/app';
import { Button } from '@ui/shad-cn/components/button';
import { ArrowLeft } from 'lucide-react';
import type * as React from 'react';
import { useEffect, useRef } from 'react';

export function PluginPageLayout({
  title,
  subtitle,
  onBack,
  backLabel,
  actions,
  footer,
  children,
}: {
  title: string;
  subtitle?: React.ReactNode;
  onBack?: () => void;
  backLabel?: string;
  actions?: React.ReactNode;
  footer?: React.ReactNode;
  children?: React.ReactNode;
}) {
  const { layout } = useApp();
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!scrollRef.current) {
      return;
    }
    layout.content.setElement(scrollRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex h-full flex-col bg-background text-foreground">
      <header className="shrink-0 flex items-center gap-2 border-b border-border/50 bg-background px-3 py-2">
        {onBack && (
          <Button
            className={'shrink-0'}
            variant="ghost"
            size="icon-md"
            onClick={onBack}
            aria-label={backLabel ?? title}
          >
            <ArrowLeft className="size-4" />
          </Button>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-base font-semibold leading-tight">{title}</h1>
          {subtitle && <p className="truncate text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </header>
      <div ref={scrollRef} className="flex-1 grow p-4 overflow-y-auto">
        {children}
      </div>
      {footer && (
        <footer className="shrink-0 border-t border-border/50 bg-background px-4 py-3 text-sm text-muted-foreground">
          {footer}
        </footer>
      )}
    </div>
  );
}
