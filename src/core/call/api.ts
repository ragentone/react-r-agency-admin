import { getMeshClient } from 'r-agency-mesh-client-v1/release';

import { CALL_ACTION_TIMEOUT_MS } from './const';
import type { CallAction, ICallChannelEvents } from './types';

export interface ICallActionResult<T> {
  success: boolean;
  data?: T;
}

/** Websocket controller `call` (runtime apps/call) – usable outside React. */
export const callAction = <T = Record<string, unknown>>(
  name: CallAction,
  data?: Record<string, unknown>
) =>
  new Promise<ICallActionResult<T>>(resolve => {
    const timer = window.setTimeout(() => resolve({ success: false }), CALL_ACTION_TIMEOUT_MS);
    try {
      getMeshClient()
        .websocket.payload()
        .controller('call')
        .action(name, {
          data,
          onResponse: result => {
            window.clearTimeout(timer);
            resolve(result as ICallActionResult<T>);
          },
        })
        .send();
    } catch (error) {
      console.warn('[call] action failed', name, error);
      window.clearTimeout(timer);
      resolve({ success: false });
    }
  });

export const callChannel = () => getMeshClient().websocket.channel<ICallChannelEvents>('call');
