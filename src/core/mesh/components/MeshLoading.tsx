import { cn } from '@ui/lib/utils';
import { motion, useReducedMotion } from 'framer-motion';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { useMeshState } from './use.mesh.ts';

export interface MeshLoadingProps {
  title?: string;
  description?: string;
  endpoint?: string;
  status?: string;
  retryCount?: number;
  className?: string;
}

/**
 * Splash screen while the mesh connection is established (X-style):
 * centered logo with a soft pulse, short text, indeterminate bar and the real
 * connection status at the bottom. Respects `prefers-reduced-motion`.
 */
const MeshLoading: React.FC<MeshLoadingProps> = ({
  title: propTitle,
  description: propDescription,
  endpoint: propEndpoint,
  status: propStatus,
  retryCount: propRetryCount,
  className,
}) => {
  const { t } = useTranslation('mesh');
  const reduceMotion = useReducedMotion();

  let contextState: ReturnType<typeof useMeshState> | null = null;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    contextState = useMeshState();
  } catch {
    contextState = null;
  }

  const status = propStatus ?? contextState?.status ?? 'connecting';
  const retryCount = propRetryCount ?? contextState?.retryCount ?? 0;

  const endpoint =
    propEndpoint ||
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_MESH_SERVER_ENDPOINT) ||
    'mesh-server';

  const title = propTitle || t('loading.title');
  const description = propDescription || t('loading.description');

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={cn(
        'relative flex min-h-dvh w-full flex-col items-center justify-center overflow-hidden bg-background px-6 select-none',
        className
      )}
    >
      {/* Short delay so fast connections don't flash the splash. */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.15, ease: 'easeOut' }}
        className="flex flex-col items-center text-center"
      >
        <div className="relative grid size-20 place-items-center">
          {!reduceMotion && (
            <>
              <motion.span
                aria-hidden="true"
                className="absolute inset-0 rounded-full border border-foreground/25"
                animate={{ scale: [1, 1.7], opacity: [0.6, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
              />
              <motion.span
                aria-hidden="true"
                className="absolute inset-0 rounded-full border border-foreground/25"
                animate={{ scale: [1, 1.7], opacity: [0.6, 0] }}
                transition={{ duration: 2, delay: 1, repeat: Infinity, ease: 'easeOut' }}
              />
            </>
          )}
          <motion.img
            src="/logo.png"
            alt=""
            aria-hidden="true"
            draggable={false}
            className="relative size-16 dark:invert"
            animate={reduceMotion ? undefined : { scale: [1, 0.94, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        <h1 className="mt-10 text-xl leading-6 font-bold tracking-tight text-foreground">
          {title}
        </h1>
        <p className="mt-1.5 max-w-[300px] text-body leading-5 text-muted-foreground">
          {description}
        </p>

        {/* Indeterminate progress */}
        <div
          aria-hidden="true"
          className="mt-8 h-1 w-40 overflow-hidden rounded-full bg-foreground/10"
        >
          {reduceMotion ? (
            <div className="h-full w-2/5 rounded-full bg-foreground" />
          ) : (
            <motion.div
              className="h-full w-2/5 rounded-full bg-foreground"
              animate={{ x: ['-100%', '250%'] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: [0.65, 0, 0.35, 1] }}
            />
          )}
        </div>
      </motion.div>

      {/* Real connection status */}
      <div className="absolute inset-x-0 bottom-0 flex justify-center px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <div className="flex max-w-full items-center gap-2 font-mono text-micro text-muted-foreground">
          <span className="relative flex size-1.5 shrink-0" aria-hidden="true">
            {!reduceMotion && (
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-foreground opacity-60" />
            )}
            <span className="relative inline-flex size-1.5 rounded-full bg-foreground" />
          </span>
          <span className="shrink-0">
            {status}
            {retryCount > 0 && ` #${retryCount}`}
          </span>
          <span aria-hidden="true">·</span>
          <span className="truncate" title={endpoint}>
            {endpoint}
          </span>
        </div>
      </div>
    </div>
  );
};

export { MeshLoading };
