import { getMeshClient } from 'r-agency-mesh-client-v1/release';

import { CREDITS_ACTION_TIMEOUT_MS } from './const.ts';
import type {
  CreditsAction,
  CreditsAdminAction,
  ICreditLiveEvents,
  ICreditResult,
} from './types.ts';

const action = <T extends ICreditResult>(
  controller: 'credits' | 'credits-admin',
  name: string,
  data?: Record<string, unknown>
) =>
  new Promise<T>(resolve => {
    const timer = window.setTimeout(
      () => resolve({ success: false, error: 'timeout' } as T),
      CREDITS_ACTION_TIMEOUT_MS
    );
    try {
      getMeshClient()
        .websocket.payload()
        .controller(controller)
        .action(name, {
          data,
          onResponse: result => {
            window.clearTimeout(timer);
            const payload = (result as { data?: T } | undefined)?.data;
            resolve(payload ?? ({ success: false, error: 'unknown' } as T));
          },
        })
        .send();
    } catch (error) {
      console.warn('[credits] action failed', name, error);
      window.clearTimeout(timer);
      resolve({ success: false, error: 'unknown' } as T);
    }
  });

/** Websocket controller `credits` (runtime src/shared/credits) – usable outside React. */
export const creditsAction = <T extends ICreditResult = ICreditResult>(
  name: CreditsAction,
  data?: Record<string, unknown>
) => action<T>('credits', name, data);

/** Websocket controller `credits-admin` (`admin:user`). */
export const creditsAdminAction = <T extends ICreditResult = ICreditResult>(
  name: CreditsAdminAction,
  data?: Record<string, unknown>
) => action<T>('credits-admin', name, data);

export const creditsChannel = () => getMeshClient().websocket.channel<ICreditLiveEvents>('credits');
