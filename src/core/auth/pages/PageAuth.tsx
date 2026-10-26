import {
  authButtonGhost,
  authButtonPrimary,
  authButtonSecondary,
} from '@core/auth/components/auth.styles.ts';
import { AuthProgressBar } from '@core/auth/components/AuthProgressBar.tsx';
import { AuthFlow } from '@core/auth/components/flow/AuthFlow.tsx';
import { useAuth } from '@core/auth/components/use.auth.ts';
import { UserGreeting } from '@core/auth/components/user/UserGreeting.tsx';
import { CoreVariables } from '@core/core.variables.ts';
import { RoutePage } from '@router/components';
import { Link } from '@tanstack/react-router';
import { cn } from '@ui/lib/utils';
import { House, LogOut, Settings } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { PageScrollTopBlock } from '../../layout/components/PageScrollTopBlock.tsx';

/**
 * Mobile first auth screen (X-style): logo + one flow for sign-in and sign-up
 * (`AuthFlow`: identifier first → passkey / password / e-mail code → 2FA).
 */
const PageAuth = () => {
  const { t } = useTranslation('auth');
  const { isLoggingIn, isLoggingOut, authorized, userMeta, loaded, preLogout } = useAuth();
  const signedIn = Boolean(authorized && userMeta?.id);

  // Already logged in → no forms, greeting + shortcuts instead.
  if (signedIn && !isLoggingIn) {
    return (
      <RoutePage width={'100%'} scrollable={true}>
        <div className="mx-auto flex w-full max-w-[440px] flex-col px-5 pt-8 pb-12 sm:pt-16">
          <UserGreeting>
            <p className="mb-4 text-body text-muted-foreground">
              {t('page.signedIn.text', { defaultValue: 'Du bist bereits angemeldet.' })}
            </p>
            <div className="flex flex-col gap-2.5">
              <Link to={CoreVariables.routePathHome as '/'} className={authButtonPrimary}>
                <House className="size-4" />
                {t('page.signedIn.home', { defaultValue: 'Zur Startseite' })}
              </Link>
              <Link to={CoreVariables.routePathAccount as '/'} className={authButtonSecondary}>
                <Settings className="size-4" />
                {t('page.signedIn.account', { defaultValue: 'Mein Konto' })}
              </Link>
              <button
                type="button"
                onClick={() => preLogout()}
                disabled={isLoggingOut}
                className={cn(authButtonGhost, 'text-muted-foreground hover:text-foreground')}
              >
                <LogOut className="size-4" />
                {t('logout.trigger')}
              </button>
            </div>
          </UserGreeting>
        </div>
      </RoutePage>
    );
  }

  // Auth state not known yet → don't flash the login form.
  if (!loaded) {
    return (
      <RoutePage width={'100%'} scrollable={true}>
        {null}
      </RoutePage>
    );
  }

  return (
    <RoutePage width={'100%'} scrollable={true}>
      {isLoggingIn && (
        <AuthProgressBar
          active={isLoggingIn}
          position="relative"
          message={t('form.submitting', { defaultValue: 'Wird angemeldet...' })}
        />
      )}

      <div className="mx-auto flex w-full max-w-[440px] flex-col px-5 pt-8 pb-12 sm:pt-16">
        <img
          src="/logo.png"
          alt=""
          aria-hidden="true"
          className="mb-8 size-10 select-none dark:invert"
          draggable={false}
        />
        <AuthFlow />
      </div>
      <PageScrollTopBlock smooth={true} />
    </RoutePage>
  );
};

export { PageAuth };
