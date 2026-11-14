import { Core } from '@core/core.api.ts';
import { lazyPage } from '@core/page/lazy.page.ts';

import { CLI_AUTH_ROUTE } from './const';

// Eigenes Modul: Terminal-Freigabe ist unabhängig vom normalen Login-Workflow.
// Kein Menüeintrag – die Seite wird über den Link aus dem Terminal geöffnet.
const PageCliAuth = lazyPage(
  () => import('./pages/PageCliAuth.tsx').then(m => m.PageCliAuth),
  'PageCliAuth'
);

// Öffentliche Route (eigene Anmeldung), wie die Site-Seiten – nicht an den Admin-Login gebunden.
Core.router.register({
  path: CLI_AUTH_ROUTE,
  target: 'index',
  page: PageCliAuth,
  meta: { title: 'Terminal freigeben' },
});
