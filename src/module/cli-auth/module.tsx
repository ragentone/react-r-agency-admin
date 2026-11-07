import { Core } from '@core/core.api.ts';
import { lazyPage } from '@core/page/lazy.page.ts';

import { CLI_AUTH_ROUTE, CLI_AUTH_SUCCESS_ROUTE } from './const';

// Eigenes Modul: Terminal-Freigabe ist unabhängig vom normalen Login-Workflow.
// Kein Menüeintrag – die Seite wird über den Link aus dem Terminal geöffnet.
const PageCliAuth = lazyPage(
  () => import('./pages/PageCliAuth.tsx').then(m => m.PageCliAuth),
  'PageCliAuth'
);
const PageCliAuthSuccess = lazyPage(
  () => import('./pages/PageCliAuthSuccess.tsx').then(m => m.PageCliAuthSuccess),
  'PageCliAuthSuccess'
);

// Öffentliche Routen (eigene Anmeldung), wie die Site-Seiten – nicht an den Admin-Login gebunden.
Core.router.register({
  path: CLI_AUTH_ROUTE,
  target: 'index',
  page: PageCliAuth,
  meta: { title: 'Terminal freigeben' },
});

Core.router.register({
  path: CLI_AUTH_SUCCESS_ROUTE,
  target: 'index',
  page: PageCliAuthSuccess,
  meta: { title: 'Terminal verbunden' },
});
