import { CoreVariables } from '@core/core.variables.ts';
import { RoutePage } from '@router/components';
import type { IRouteProps } from '@router/types.ts';
import { Link } from '@tanstack/react-router';
import { cn } from '@ui/lib/utils';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Check, MailCheck, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useAuth } from '../components/use.auth.ts';
import { useUserConfirm } from '../hooks/use.user.confirm.ts';

type State =
  | { status: 'verifying' }
  | { status: 'success' }
  | { status: 'error'; errorKey?: string }
  | { status: 'missing' };

/**
 * Target of the confirm link from the "user created" e-mail: `/user/confirm?token=…`.
 * Confirms the e-mail address once and shows the result.
 */
const PageUserConfirm = (props: IRouteProps<{ token?: string }>) => {
  const { t } = useTranslation('auth');
  const reduceMotion = useReducedMotion();
  const { confirm } = useUserConfirm();
  const { authorized } = useAuth();
  const token = props.data?.token;
  const [state, setState] = useState<State>(() =>
    token ? { status: 'verifying' } : { status: 'missing' }
  );

  useEffect(() => {
    if (!token) return;
    let active = true;
    void confirm(token).then(outcome => {
      if (!active) return;
      setState(
        outcome.success ? { status: 'success' } : { status: 'error', errorKey: outcome.errorKey }
      );
    });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const errorText = (() => {
    if (state.status === 'missing') return t('confirmPage.missing');
    if (state.status !== 'error') return '';
    const key = state.errorKey;
    return key && t(key, { defaultValue: '' }) ? t(key) : t('confirmPage.failed');
  })();

  const content = {
    verifying: {
      icon: MailCheck,
      title: t('confirmPage.verifyingTitle'),
      text: t('confirmPage.verifyingText'),
    },
    success: {
      icon: Check,
      title: t('confirmPage.successTitle'),
      text: t('user_confirmed_successfully'),
    },
    error: { icon: X, title: t('confirmPage.errorTitle'), text: errorText },
    missing: { icon: X, title: t('confirmPage.errorTitle'), text: errorText },
  }[state.status];

  const Icon = content.icon;
  const done = state.status !== 'verifying';

  return (
    <RoutePage width={'100%'} scrollable={true}>
      <div className="mx-auto flex w-full max-w-110 flex-col px-5 pt-8 pb-12 sm:pt-16">
        <img
          src="/logo.png"
          alt=""
          aria-hidden="true"
          className="mb-10 size-10 select-none dark:invert"
          draggable={false}
        />

        <div role="status" aria-live="polite" className="flex flex-col items-start">
          {/* Status badge: spinning ring while verifying, solid with icon afterwards. */}
          <div className="relative mb-8 grid size-20 place-items-center">
            <motion.span
              aria-hidden
              className={cn(
                'absolute inset-0 rounded-full',
                done
                  ? state.status === 'success'
                    ? 'bg-foreground'
                    : 'border-2 border-foreground'
                  : 'bg-[conic-gradient(from_0deg,var(--color-foreground),transparent_70%)]'
              )}
              animate={!done && !reduceMotion ? { rotate: 360 } : { rotate: 0 }}
              transition={
                !done ? { duration: 1, repeat: Infinity, ease: 'linear' } : { duration: 0 }
              }
            />
            {!done && (
              <span aria-hidden className="absolute inset-[3px] rounded-full bg-background" />
            )}
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={state.status}
                initial={reduceMotion ? false : { scale: 0.4, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={reduceMotion ? undefined : { scale: 0.4, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 480, damping: 24 }}
                className={cn(
                  'relative grid place-items-center',
                  state.status === 'success' ? 'text-background' : 'text-foreground'
                )}
              >
                <Icon className="size-8" strokeWidth={state.status === 'verifying' ? 1.75 : 2.75} />
              </motion.span>
            </AnimatePresence>
          </div>

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={state.status}
              initial={reduceMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="w-full"
            >
              <h1 className="mb-3 text-[31px] leading-9 font-extrabold tracking-tight text-foreground sm:text-4xl">
                {content.title}
              </h1>
              <p className="text-body text-pretty text-muted-foreground">{content.text}</p>

              {done && (
                <div className="mt-8 flex flex-col gap-2.5">
                  {state.status === 'success' && !authorized && (
                    <Link
                      to={CoreVariables.routePathAuth as '/'}
                      className="group inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground text-body font-bold text-background transition-opacity hover:opacity-90"
                    >
                      {t('confirmPage.toLogin')}
                      <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  )}
                  {(state.status !== 'success' || authorized) && (
                    <Link
                      to={CoreVariables.routePathHome as '/'}
                      className={cn(
                        'inline-flex h-12 w-full items-center justify-center rounded-full text-body font-bold transition-colors',
                        state.status === 'success'
                          ? 'bg-foreground text-background hover:opacity-90'
                          : 'border border-border/50 text-foreground hover:bg-foreground/[0.05]'
                      )}
                    >
                      {t('confirmPage.toHome')}
                    </Link>
                  )}
                  {state.status !== 'success' && !authorized && (
                    <Link
                      to={CoreVariables.routePathAuth as '/'}
                      className="inline-flex h-12 w-full items-center justify-center rounded-full bg-foreground text-body font-bold text-background transition-opacity hover:opacity-90"
                    >
                      {t('confirmPage.toLogin')}
                    </Link>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </RoutePage>
  );
};

export { PageUserConfirm };
