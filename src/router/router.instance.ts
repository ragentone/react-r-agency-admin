import { setPluginNavigate } from '@core/plugin/plugin.navigate';

import { createBaseRouter } from './index.ts';

/**
 * The app's router – created once, in its own module. Kept out of `App.tsx` so a hot reload
 * of the App component doesn't create a new router (route state / loaders would restart).
 * Created after all `core.tsx` / `app.tsx` registrations ran (they're imported first in main.tsx).
 */
export const router = createBaseRouter();

// Plugins navigate through the app's router (`api.navigate`, `api.Link`).
setPluginNavigate(({ pathname, search, replace }) => {
  void router.navigate({ to: pathname, search, replace } as unknown as Parameters<typeof router.navigate>[0]);
});
