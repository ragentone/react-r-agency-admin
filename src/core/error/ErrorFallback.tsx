import { cn } from '@ui/lib/utils';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  ArrowLeft,
  Check,
  ChevronDown,
  Copy,
  Home,
  RefreshCw,
  RotateCcw,
  TriangleAlert,
} from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { ErrorFallbackProps } from './types.ts';

const copyText = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    // Clipboard API not permitted (e.g. insecure context) → legacy fallback.
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  }
};

const primaryButton =
  'inline-flex h-11 items-center justify-center gap-2 rounded-full bg-foreground px-5 text-body font-bold text-background transition-opacity hover:opacity-85 active:opacity-75 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none';
const secondaryButton =
  'inline-flex h-11 items-center justify-center gap-2 rounded-full border border-border/50 px-5 text-body font-bold text-foreground transition-colors hover:bg-foreground/[0.06] active:bg-foreground/10 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none';
const ghostButton =
  'inline-flex h-10 items-center justify-center gap-1.5 rounded-full px-4 text-body font-medium text-muted-foreground transition-colors hover:bg-foreground/[0.06] hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none';

/**
 * Error screen (router errors + ErrorBoundary). Monochrome, mobile first:
 * icon, message, actions (retry · reload · home/back) and collapsible technical details.
 * `variant="minimal"` renders a compact card for errors inside a page section.
 */
export const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  errorInfo,
  resetErrorBoundary,
  reset,
  info,
  title,
  description,
  showHomeButton = true,
  showReloadButton = true,
  showResetButton = true,
  showDetails = true,
  customAction,
  className,
  variant = 'fullscreen',
}) => {
  const { t } = useTranslation('error');
  const reduceMotion = useReducedMotion();
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleReset = resetErrorBoundary || reset;
  const minimal = variant === 'minimal';

  const errorMessage =
    error instanceof Error
      ? error.message
      : typeof error === 'string'
        ? error
        : t('unknown', { defaultValue: 'An unexpected error occurred.' });
  const errorStack = error instanceof Error ? error.stack : undefined;
  const componentStack =
    errorInfo?.componentStack ||
    (info && 'componentStack' in info ? info.componentStack : undefined);

  const handleCopy = async () => {
    await copyText(
      [
        `Error: ${errorMessage}`,
        errorStack ? `\nStack Trace:\n${errorStack}` : '',
        componentStack ? `\nComponent Stack:\n${componentStack}` : '',
        `\nTimestamp: ${new Date().toISOString()}`,
        `URL: ${window.location.href}`,
        `User Agent: ${navigator.userAgent}`,
      ]
        .filter(Boolean)
        .join('\n')
    );
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2500);
  };

  // The boundary may sit outside the router → plain browser navigation.
  const goHome = () => {
    window.location.href = '/';
  };
  const goBack = () => {
    if (window.history.length > 1) window.history.back();
    else goHome();
  };

  const enter = reduceMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 } }
    : { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } };

  return (
    <div
      role="alert"
      data-slot="error-fallback"
      data-variant={variant}
      className={cn(
        'flex w-full justify-center overflow-auto bg-background text-foreground',
        minimal
          ? 'px-4 py-8'
          : 'min-h-dvh items-center px-4 pt-[max(3rem,env(safe-area-inset-top))] pb-[max(3rem,env(safe-area-inset-bottom))]',
        className
      )}
    >
      <motion.div
        {...enter}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          'flex w-full flex-col items-center text-center',
          minimal ? 'max-w-md rounded-2xl border border-border/50 p-6' : 'max-w-md'
        )}
      >
        {/* Icon */}
        <motion.span
          initial={reduceMotion ? false : { scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.05 }}
          className={cn(
            'grid place-items-center rounded-full border border-border/50',
            minimal ? 'mb-4 size-12' : 'mb-6 size-16'
          )}
          aria-hidden="true"
        >
          <TriangleAlert className={minimal ? 'size-5' : 'size-7'} strokeWidth={1.75} />
        </motion.span>

        {!minimal && (
          <span className="mb-3 rounded-full border border-border/50 px-2.5 py-0.5 text-micro font-bold tracking-widest text-muted-foreground uppercase">
            {t('badge', { defaultValue: 'Error' })}
          </span>
        )}

        <h1
          className={cn(
            'font-extrabold tracking-tight text-balance',
            minimal ? 'text-title' : 'text-display'
          )}
        >
          {title ?? t('title', { defaultValue: 'Something went wrong' })}
        </h1>
        <p className="mt-2 max-w-sm text-body text-pretty text-muted-foreground">
          {description ??
            t('description', {
              defaultValue:
                "This part couldn't be displayed. Please try again – your data is safe.",
            })}
        </p>

        {/* Actions */}
        <div className="mt-7 flex w-full flex-col gap-2.5 sm:w-auto sm:flex-row sm:justify-center">
          {showResetButton && handleReset && (
            <button type="button" onClick={handleReset} className={primaryButton}>
              <RotateCcw className="size-4" />
              {t('actions.retry', { defaultValue: 'Try again' })}
            </button>
          )}
          {showReloadButton && (
            <button
              type="button"
              onClick={() => window.location.reload()}
              className={handleReset && showResetButton ? secondaryButton : primaryButton}
            >
              <RefreshCw className="size-4" />
              {t('actions.reload', { defaultValue: 'Reload page' })}
            </button>
          )}
          {customAction}
        </div>

        {showHomeButton && !minimal && (
          <div className="mt-3 flex items-center justify-center gap-1">
            <button type="button" onClick={goBack} className={ghostButton}>
              <ArrowLeft className="size-4" />
              {t('actions.back', { defaultValue: 'Go back' })}
            </button>
            <span className="text-muted-foreground" aria-hidden="true">
              ·
            </span>
            <button type="button" onClick={goHome} className={ghostButton}>
              <Home className="size-4" />
              {t('actions.home', { defaultValue: 'Go home' })}
            </button>
          </div>
        )}

        {/* Technical details */}
        {showDetails && (
          <div className="mt-8 w-full overflow-hidden rounded-2xl border border-border/50 text-left">
            <button
              type="button"
              onClick={() => setDetailsOpen(open => !open)}
              aria-expanded={detailsOpen}
              className="flex w-full items-center justify-between gap-3 px-4 py-3 text-body font-bold transition-colors hover:bg-foreground/[0.04] focus-visible:bg-foreground/[0.06] focus-visible:outline-none"
            >
              {t('details.toggle', { defaultValue: 'Technical details' })}
              <ChevronDown
                className={cn(
                  'size-4 text-muted-foreground transition-transform duration-200',
                  detailsOpen && 'rotate-180'
                )}
              />
            </button>

            <AnimatePresence initial={false}>
              {detailsOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22 }}
                  className="overflow-hidden"
                >
                  <div className="border-t border-border/50 p-4">
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <code className="min-w-0 font-mono text-caption break-words text-foreground">
                        {errorMessage}
                      </code>
                      <button
                        type="button"
                        onClick={() => void handleCopy()}
                        className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border border-border/50 px-3 text-caption font-bold transition-colors hover:bg-foreground/[0.06]"
                      >
                        {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                        {copied
                          ? t('details.copied', { defaultValue: 'Copied' })
                          : t('details.copy', { defaultValue: 'Copy' })}
                      </button>
                    </div>

                    <div className="max-h-64 overflow-auto rounded-xl bg-foreground/[0.04] p-3 font-mono text-micro leading-relaxed text-muted-foreground">
                      {errorStack && (
                        <section className="mb-3 last:mb-0">
                          <h2 className="mb-1 font-bold text-foreground">
                            {t('details.stack', { defaultValue: 'Stack trace' })}
                          </h2>
                          <pre className="whitespace-pre-wrap">{errorStack}</pre>
                        </section>
                      )}
                      {componentStack && (
                        <section>
                          <h2 className="mb-1 font-bold text-foreground">
                            {t('details.component', { defaultValue: 'Component stack' })}
                          </h2>
                          <pre className="whitespace-pre-wrap">{componentStack}</pre>
                        </section>
                      )}
                      {!errorStack && !componentStack && (
                        <p>{t('details.none', { defaultValue: 'No stack trace available.' })}</p>
                      )}
                    </div>
                    <p className="mt-3 text-caption text-muted-foreground">
                      {t('hint', {
                        defaultValue:
                          'If it keeps happening, copy the details and send them to support.',
                      })}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    </div>
  );
};
