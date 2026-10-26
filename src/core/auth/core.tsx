import { useAuthStore } from '@core/auth/auth.store.tsx';
import { CheckAuthQuery } from '@core/auth/graphql';
import { Core } from '@core/core.api.ts';
import { NotifyActions } from '@core/notify';
import { useSecurityStore } from '@core/security/store.ts';

import { ExtensionDeleteUser } from './extensions';

Core.extension.add({
  component: ExtensionDeleteUser,
  sortOrder: -9999,
});

Core.roles.register({
  label: 'Super administrator',
  role: 'super:admin:user',
  assignable: false,
});

Core.events.core.on(
  'router:before_load_auth_route',
  async args => {
    const { data } = await args.payload.client.graphql().query({ query: CheckAuthQuery });
    if (data?.userCheckAuth?.authorized) {
      return;
    }
    args.preventDefault();
    const store = useAuthStore.getState();
    store.setAfterLoginRoute(args.payload.location);
  },
  {
    priority: -9999,
    stopOnError: false,
  }
);

// "New sign-in" notification (runtime shared/auth) → account → devices drawer
// (the AuthProvider navigates to the account page when a drawer is requested elsewhere).
NotifyActions.register('auth::open_sessions', () => {
  useSecurityStore.getState().openDrawer('sessions');
  return true;
});

// "Failed sign-in attempts" notification → account → passkeys drawer.
NotifyActions.register('auth::open_passkeys', () => {
  useSecurityStore.getState().openDrawer('passkeys');
  return true;
});
