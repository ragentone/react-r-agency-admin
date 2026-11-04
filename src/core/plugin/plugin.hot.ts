import { createPluginApi } from './plugin.host';
import { importPlugin } from './plugin.loader';
import { unregisterPlugin } from './plugin.slots';
import type { IPluginRef } from './plugin.types';

const POLL_INTERVAL_MS = 1000;
const watched = new Set<string>();

/**
 * Hot reload for development plugins. Only plugins with `dev` set are watched; the server sends
 * that only outside production.
 *
 * Every second the revision of the dev build is requested. On change the new bundle is imported
 * and replaces the old registration. A broken build is logged and the previous version keeps
 * running. The next change is picked up again, no retry loop.
 */
export const watchPluginDev = (ref: IPluginRef): void => {
  const dev = ref.dev;
  if (!dev || watched.has(ref.id)) return;
  watched.add(ref.id);

  const bundleBase = ref.bundleUrl.split('?')[0];
  let revision = dev.revision;
  let busy = false;

  globalThis.setInterval(async () => {
    if (busy) return;
    busy = true;
    try {
      const response = await fetch(dev.revisionUrl, { cache: 'no-store' });
      if (!response.ok) return;
      const body = (await response.json()) as { revision?: string };
      if (!body.revision || body.revision === revision) return;

      // Set first: a broken build is reported once, not on every poll.
      revision = body.revision;
      try {
        const plugin = await importPlugin(ref, `${bundleBase}?r=${revision}`);
        unregisterPlugin(ref.id);
        plugin.register(
          createPluginApi(
            ref.id,
            ref.slots,
            ref.assetBaseUrl,
            ref.pages,
            ref.intervene,
            ref.config ?? {}
          )
        );
        console.info(`[plugin:${ref.id}] neu geladen (${revision})`);
      } catch (error) {
        console.error(
          `[plugin:${ref.id}] neu laden fehlgeschlagen, alte Version bleibt aktiv`,
          (error as Error)?.message ?? error
        );
      }
    } catch {
      // Server not reachable (restart, network). Try again on the next tick.
    } finally {
      busy = false;
    }
  }, POLL_INTERVAL_MS);
};
