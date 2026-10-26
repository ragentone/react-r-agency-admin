import { useAuthStore } from '@core/auth/auth.store.tsx';
import { CheckAuthQuery } from '@core/auth/graphql';
import { CoreVariables } from '@core/core.variables.ts';
import { Events } from '@core/event';

Events.core.on('router:before_load_admin_route', async args => {
  const { data } = await args.payload.client.graphql().query({
    query: CheckAuthQuery,
    variables: {
      userRole: 'admin:user',
    },
  });

  if (!data?.userCheckAuth?.hasPromission) {
    args.assign({
      redirect: CoreVariables.routePathHome,
    });
    return;
  }

  if (!data?.userCheckAuth?.authorized) {
    args.preventDefault();
    const store = useAuthStore.getState();
    store.setAfterLoginRoute(args.payload.location);
  }
});
