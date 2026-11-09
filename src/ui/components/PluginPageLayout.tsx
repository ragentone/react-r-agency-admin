import type * as React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@ui/shad-cn/components/button';

/**
 * Seitenlayout für Plugins (`api.ui.PageLayout`): fixer Header mit Zurück-Button, Titel, Untertitel und
 * rechtem Bereich für Buttons; der Inhalt scrollt; der Footer bleibt unten stehen. Flexbox, mobile first.
 */
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
  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-border/50 bg-background px-4 py-3">
        {onBack && (
          <Button variant="ghost" size="icon" onClick={onBack} aria-label={backLabel ?? title}>
            <ArrowLeft className="size-5" />
          </Button>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-bold">{title}</h1>
          {subtitle && <p className="truncate text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </header>
      <main className="flex-1 p-4">{children}</main>
      {footer && (
        <footer className="sticky bottom-0 z-10 border-t border-border/50 bg-background px-4 py-3 text-sm text-muted-foreground">
          {footer}
        </footer>
      )}
    </div>
  );
}
