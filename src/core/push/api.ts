import { getMeshClient } from 'r-agency-mesh-client-v1/release';

import { PUSH_ACTION_TIMEOUT_MS } from './const';

type PushAction = 'config' | 'subscribe' | 'unsubscribe';

/** Websocket controller `push` (runtime src/shared/push). */
export const pushAction = <T = Record<string, unknown>>(
  name: PushAction,
  data?: Record<string, unknown>
) =>
  new Promise<{ success: boolean; data?: T & { error?: string } }>(resolve => {
    const timer = window.setTimeout(() => resolve({ success: false }), PUSH_ACTION_TIMEOUT_MS);
    try {
      getMeshClient()
        .websocket.payload()
        .controller('push')
        .action(name, {
          data,
          onResponse: result => {
            window.clearTimeout(timer);
            resolve(result as { success: boolean; data?: T & { error?: string } });
          },
        })
        .send();
    } catch (error) {
      console.warn('[push] action failed', name, error);
      window.clearTimeout(timer);
      resolve({ success: false });
    }
  });
