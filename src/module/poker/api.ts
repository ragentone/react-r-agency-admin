import { getMeshClient } from 'r-agency-mesh-client-v1/release';

import { POKER_ACTION_TIMEOUT_MS } from './const.ts';
import type { IPokerAdminResult } from './types.ts';

export type PokerAdminAction =
  | 'overview'
  | 'settings'
  | 'saveSettings'
  | 'resetSettings'
  | 'hands'
  | 'hand'
  | 'pairs'
  | 'closeTable'
  | 'cancelTournament';

/** Websocket controller `poker-admin` (`admin:user`, checked by the runtime on every call). */
export const pokerAdminAction = <T extends IPokerAdminResult = IPokerAdminResult>(
  name: PokerAdminAction,
  data?: Record<string, unknown>
) =>
  new Promise<T>(resolve => {
    const timer = window.setTimeout(
      () => resolve({ success: false, error: 'timeout' } as T),
      POKER_ACTION_TIMEOUT_MS
    );
    try {
      getMeshClient()
        .websocket.payload()
        .controller('poker-admin')
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
      console.warn('[poker-admin] action failed', name, error);
      window.clearTimeout(timer);
      resolve({ success: false, error: 'unknown' } as T);
    }
  });
