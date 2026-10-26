import { ProviderManager } from '@core/provider';

import { CallProvider } from './components/CallProvider';

// 1:1 video/voice calls between friends (signaling: runtime apps/call, media: PeerJS).
ProviderManager.add({
  alias: 'call',
  target: 'route',
  sortOrder: 21,
  config: { provider: CallProvider },
});
