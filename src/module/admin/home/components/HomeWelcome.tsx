import { useAuthStore } from '@core/auth/auth.store.tsx';
import { CoreVariables } from '@core/core.variables.ts';
import { useRouter } from '@tanstack/react-router';
import { Button } from '@ui/shad-cn/components/button.tsx';
import { LayoutDashboard, LogIn, ShieldOff } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Start page for visitors without admin access: a centered card instead of an empty page.
 * Signed out → sign-in button, signed in without the admin role → short notice.
 */
export const HomeWelcome: React.FC = () => {
  const { t } = useTranslation('admin');
  const { navigate } = useRouter();
  const authorized = useAuthStore(state => state.authorized);
  const Icon = authorized ? ShieldOff : LayoutDashboard;

  return (
    <section
      data-slot="admin-welcome"
      className="mx-auto flex min-h-[60dvh] w-full max-w-sm flex-col items-center justify-center gap-6 px-6 py-16 text-center"
    >
      <span className="grid size-14 place-items-center rounded-full border border-border/50 bg-muted/50">
        <Icon className="size-6" aria-hidden="true" />
      </span>
      <div className="flex flex-col gap-1.5">
        <h1 className="text-display font-bold text-foreground">{t('home.welcome.title')}</h1>
        <p className="text-body text-muted-foreground">
          {t(authorized ? 'home.welcome.noAccess' : 'home.welcome.description')}
        </p>
      </div>
      {!authorized && (
        <Button
          size="lg"
          className="w-full rounded-full font-bold"
          onClick={() => void navigate({ to: CoreVariables.routePathAuth })}
        >
          <LogIn aria-hidden="true" />
          {t('home.welcome.login')}
        </Button>
      )}
    </section>
  );
};
