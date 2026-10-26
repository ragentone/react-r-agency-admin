import { useContext } from 'react';

import { PwaContext } from './pwa.context.ts';

/** `useAttention` of the settings entry → blinking dot on the settings button (dock / sidebar). */
export const usePwaUpdateAttention = () => Boolean(useContext(PwaContext)?.needRefresh);
