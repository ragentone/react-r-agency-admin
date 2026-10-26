import { CoreVariables } from '@core/core.variables.ts';
import { useRouter } from '@tanstack/react-router';
import { cn } from '@ui/lib/utils';
import { Button } from '@ui/shad-cn/components/button';
import { Lock, LogIn, ShieldOff } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { useAuth } from '../use.auth.ts';

interface IProps {
  /** Overrides the default title (logged out → "Bitte anmelden", logged in → "Kein Zugriff"). */
  title?: ReactNode;
  description?: ReactNode;
  /** `page` → fills the screen (mobile first, centered), `inline` → compact block inside a page. */
  variant?: 'page' | 'inline';
  /** Hides the back / home buttons. */
  hideActions?: boolean;
  className?: string;
}

/**
 * Default fallback for `<UserRole>` / `<RoleGate>`:
 * logged out → login prompt, logged in without role → "no access" with back / home.
 *
 * ```tsx
 * <UserRole role="admin:user" fallback={<UserRoleFallback />}>
 *   <AdminPanel />
 * </UserRole>
 * ```
 */
const UserRoleFallback = ({
  title,
  description,
  variant = 'page',
  hideActions = false,
  className,
}: IProps) => {
  const { t } = useTranslation('auth');
  const { authorized } = useAuth();
  const router = useRouter();
  const isPage = variant === 'page';
  const Icon = authorized ? ShieldOff : Lock;

  const goBack = () => {
    if (window.history.length > 1) router.history.back();
    else void router.navigate({ to: CoreVariables.routePathHome });
  };

  return (
    <section
      role="alert"
      aria-live="polite"
      className={cn(
        'flex w-full flex-col items-center justify-center px-4 text-center',
        isPage ? 'min-h-[60dvh] py-12' : 'py-8',
        className
      )}
    >
      <div
        className={cn(
          'mb-5 flex items-center justify-center rounded-full border border-foreground/10 bg-foreground text-background',
          isPage ? 'size-16' : 'size-12'
        )}
      >
        <Icon className={isPage ? 'size-7' : 'size-5'} strokeWidth={2.25} />
      </div>

      <h2
        className={cn(
          'max-w-sm font-extrabold tracking-tight text-foreground text-balance',
          isPage ? 'text-[1.75rem] leading-8' : 'text-xl'
        )}
      >
        {title ?? t(authorized ? 'roleFallback.denied.title' : 'roleFallback.login.title')}
      </h2>

      <p className="mt-2 max-w-sm text-[0.9375rem] leading-5 text-muted-foreground text-balance">
        {description ??
          t(authorized ? 'roleFallback.denied.description' : 'roleFallback.login.description')}
      </p>

      {!hideActions && (
        <div className="mt-7 flex w-full max-w-xs flex-col gap-3">
          {authorized ? (
            <>
              <Button size="lg" className="h-11 w-full rounded-full font-bold" onClick={goBack}>
                {t('roleFallback.denied.back')}
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-11 w-full rounded-full font-bold"
                onClick={() => void router.navigate({ to: CoreVariables.routePathHome })}
              >
                {t('roleFallback.denied.home')}
              </Button>
            </>
          ) : (
            <Button
              size="lg"
              className="h-11 w-full rounded-full font-bold"
              onClick={() => void router.navigate({ to: CoreVariables.routePathAuth })}
            >
              <LogIn />
              {t('roleFallback.login.action')}
            </Button>
          )}
        </div>
      )}
    </section>
  );
};

export { UserRoleFallback };
