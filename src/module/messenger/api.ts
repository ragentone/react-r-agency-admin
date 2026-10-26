import { getMeshClient } from 'r-agency-mesh-client-v1/release';

import { MESSENGER_ACTION_TIMEOUT_MS } from './const.ts';
import type { IMessengerActionResult, IMessengerLiveEvents, MessengerAction } from './types.ts';

/** Websocket controller `messenger` (runtime src/shared/messenger) – usable outside React. */
export const messengerAction = <T = Record<string, unknown>>(
  name: MessengerAction,
  data?: Record<string, unknown>
) =>
  new Promise<IMessengerActionResult<T>>(resolve => {
    const timer = window.setTimeout(
      () => resolve({ success: false, data: { error: 'timeout' } as never }),
      MESSENGER_ACTION_TIMEOUT_MS
    );
    try {
      getMeshClient()
        .websocket.payload()
        .controller('messenger')
        .action(name, {
          data,
          onResponse: result => {
            window.clearTimeout(timer);
            resolve(result as IMessengerActionResult<T>);
          },
        })
        .send();
    } catch (error) {
      console.warn('[messenger] action failed', name, error);
      window.clearTimeout(timer);
      resolve({ success: false });
    }
  });

export const messengerChannel = () =>
  getMeshClient().websocket.channel<IMessengerLiveEvents>('messenger');
