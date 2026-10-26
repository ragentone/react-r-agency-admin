import { createBaseRouter } from './index.ts';

/**
 * The app's router – created once, in its own module. Kept out of `App.tsx` so a hot reload
 * of the App component doesn't create a new router (route state / loaders would restart).
 * Created after all `core.tsx` / `app.tsx` registrations ran (they're imported first in main.tsx).
 */
export const router = createBaseRouter();
