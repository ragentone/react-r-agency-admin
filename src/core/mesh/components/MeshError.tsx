import { Badge } from '@ui/shad-cn/components/badge.tsx';
import { Button } from '@ui/shad-cn/components/button.tsx';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@ui/shad-cn/components/card.tsx';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle,
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  Radio,
  RefreshCw,
  RotateCcw,
} from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useMeshState } from './use.mesh.ts';

export type MeshErrorStatus =
  'idle' | 'connecting' | 'connected' | 'reconnecting' | 'disconnected' | 'error';

export interface MeshErrorProps {
  status?: MeshErrorStatus;
  retryCount?: number;
  error?: string | Error | null;
  onRetry?: () => void;
  title?: string;
  description?: string;
  endpoint?: string;
  showDetails?: boolean;
  className?: string;
}

const MeshError: React.FC<MeshErrorProps> = ({
  status: propStatus,
  retryCount: propRetryCount,
  error: propError,
  onRetry: propOnRetry,
  title: propTitle,
  description: propDescription,
  endpoint: propEndpoint,
  showDetails = true,
  className = '',
}) => {
  const { t } = useTranslation('mesh');

  let contextState: ReturnType<typeof useMeshState> | null = null;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    contextState = useMeshState();
  } catch {
    contextState = null;
  }

  const status = propStatus ?? contextState?.status ?? 'error';
  const retryCount = propRetryCount ?? contextState?.retryCount ?? 0;
  const error = propError ?? contextState?.error ?? null;
  const onRetry = propOnRetry ?? contextState?.reconnect;

  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isManualRetrying, setIsManualRetrying] = useState(false);

  const endpoint =
    propEndpoint ||
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_MESH_SERVER_ENDPOINT) ||
    'mesh-server';

  const isReconnecting = status === 'reconnecting' || isManualRetrying;
  const isDisconnected = status === 'disconnected';

  const errorMessage =
    error instanceof Error
      ? error.message
      : typeof error === 'string'
        ? error
        : isDisconnected
          ? t('error.messages.disconnected')
          : t('error.messages.failed');

  const defaultTitle = isReconnecting
    ? t('error.title.reconnecting')
    : isDisconnected
      ? t('error.title.disconnected')
      : t('error.title.failed');

  const defaultDescription = isReconnecting
    ? t('error.description.reconnecting')
    : isDisconnected
      ? t('error.description.disconnected')
      : t('error.description.failed');

  const title = propTitle || defaultTitle;
  const description = propDescription || defaultDescription;

  const handleRetry = async () => {
    if (onRetry) {
      setIsManualRetrying(true);
      try {
        await Promise.resolve(onRetry());
      } finally {
        setTimeout(() => setIsManualRetrying(false), 1200);
      }
    }
  };

  const handleReload = () => {
    window.location.reload();
  };

  const handleCopyDetails = async () => {
    const details = [
      `[Mesh Connection Diagnostic]`,
      `Status: ${status}`,
      `Retry Count: ${retryCount}`,
      `Endpoint: ${endpoint}`,
      `Error: ${errorMessage}`,
      `Timestamp: ${new Date().toISOString()}`,
      `URL: ${window.location.href}`,
      `User Agent: ${navigator.userAgent}`,
    ].join('\n');

    try {
      await navigator.clipboard.writeText(details);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = details;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <div
      className={`relative flex min-h-screen w-full items-center justify-center p-4 sm:p-6 lg:p-8 bg-background/95 backdrop-blur-sm select-none ${className}`}
    >
      {/* Background ambient glow effect */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0.15, scale: 0.8 }}
          animate={{
            opacity: [0.15, 0.3, 0.15],
            scale: [0.9, 1.1, 0.9],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className={`h-96 w-96 rounded-full blur-3xl ${
            isDisconnected
              ? 'bg-amber-500/20 dark:bg-amber-500/10'
              : 'bg-destructive/20 dark:bg-destructive/10'
          }`}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-lg"
      >
        <Card className="bg-card/90 backdrop-blur-md transition-all duration-300 border-none shadow-none">
          <CardHeader className="space-y-4 pb-4 text-center">
            <div className="space-y-1.5">
              <CardTitle className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                {title}
              </CardTitle>
              <CardDescription className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                {description}
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 pt-0">
            {/* Error Message Box */}
            {errorMessage && (
              <div className="flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-3.5 text-left text-sm text-destructive dark:border-destructive/30 dark:bg-destructive/10">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <p className="flex-1 font-medium leading-snug wrap-break-word">{errorMessage}</p>
              </div>
            )}

            {/* Diagnostic Details Accordion */}
            {showDetails && (
              <div className="rounded-xl border border-border/50 bg-muted/40 overflow-hidden transition-all">
                <button
                  type="button"
                  onClick={() => setIsDetailsOpen(prev => !prev)}
                  className="flex w-full items-center justify-between px-4 py-2.5 text-xs font-semibold text-muted-foreground hover:bg-muted/70 transition-colors"
                >
                  <span className="flex items-center gap-1.5">
                    <Radio className="h-3.5 w-3.5" />
                    {t('error.diagnostics.title')}
                  </span>
                  {isDetailsOpen ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>

                <AnimatePresence>
                  {isDetailsOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-t border-border/50 p-3 space-y-2 text-xs font-mono"
                    >
                      <div className="grid grid-cols-3 gap-1 text-muted-foreground">
                        <span className="text-foreground/70">
                          {t('error.diagnostics.endpoint')}:
                        </span>
                        <span className="col-span-2 truncate text-right text-foreground font-semibold">
                          {endpoint}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-1 text-muted-foreground">
                        <span className="text-foreground/70">{t('error.diagnostics.status')}:</span>
                        <span className="col-span-2 text-right uppercase font-semibold text-foreground">
                          {status}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-1 text-muted-foreground">
                        <span className="text-foreground/70">
                          {t('error.diagnostics.retries')}:
                        </span>
                        <span className="col-span-2 text-right font-semibold text-primary">
                          {retryCount}
                        </span>
                      </div>
                      <div className="pt-2 flex justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleCopyDetails}
                          className="h-7 text-xs gap-1.5 text-muted-foreground hover:text-foreground"
                        >
                          {isCopied ? (
                            <>
                              <Check className="h-3.5 w-3.5 text-green-500" />
                              <span>{t('error.diagnostics.copied')}</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3.5 w-3.5" />
                              <span>{t('error.diagnostics.copy')}</span>
                            </>
                          )}
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              <Badge
                variant="outline"
                className="flex items-center gap-1.5 border-border/50 bg-background/50 px-3 py-1 font-mono text-xs text-foreground"
              >
                <RotateCcw className={`h-3 w-3 ${isReconnecting ? 'animate-spin' : ''}`} />
                <span>{t('error.diagnostics.retryCount')}</span>
                <span className="font-bold text-primary">{retryCount}</span>
              </Badge>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col sm:flex-row gap-2.5 pt-2">
            {onRetry && (
              <Button
                variant="default"
                onClick={handleRetry}
                disabled={isReconnecting}
                className="w-full sm:flex-1 gap-2 shadow-md hover:shadow-lg transition-all"
              >
                <RefreshCw className={`h-4 w-4 ${isReconnecting ? 'animate-spin' : ''}`} />
                <span>
                  {isReconnecting ? t('error.actions.reconnecting') : t('error.actions.retry')}
                </span>
              </Button>
            )}

            <Button
              variant="outline"
              onClick={handleReload}
              className="w-full sm:w-auto gap-2 border-border/50"
            >
              <RotateCcw className="h-4 w-4" />
              <span>{t('error.actions.reload')}</span>
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export { MeshError };
