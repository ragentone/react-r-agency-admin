import { Core } from '@core/core.api.ts';
import { MediaProvider } from '@core/media/provider';

Core.provider.add({
  config: {
    provider: MediaProvider,
  },
  sortOrder: 0,
  alias: 'media',
  target: 'route',
});
