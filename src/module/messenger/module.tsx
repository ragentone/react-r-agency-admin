import { Core } from '@core/core.api.ts';
import { ProviderManager } from '@core/provider';
import { MessengerProfileButton } from '@module/messenger/components';
import { Button } from '@ui/shad-cn/components/button.tsx';
import { MessageCircle } from 'lucide-react';

import { MessengerProvider } from './components/MessengerProvider.tsx';
import { MESSENGER_LAYER_DELAY_MS } from './const.ts';
import { markMessengerActive } from './feature.ts';
import { openMessenger, useMessengerStore } from './store.ts';

markMessengerActive();

ProviderManager.add({
  alias: 'messenger',
  target: 'route',
  sortOrder: 22,
  config: { provider: MessengerProvider },
});

Core.menu.register({
  id: 'messenger',
  label: 'messenger:menu.label',
  description: 'messenger:menu.description',
  icon: MessageCircle,
  section: 'main',
  audience: 'user',
  sortOrder: 5,
  onSelect: () => window.setTimeout(() => openMessenger(), MESSENGER_LAYER_DELAY_MS),
  useBadge: () => useMessengerStore(state => state.unreadTotal) || null,
});

Core.cms.register('profile-call-buttons', {
  component: MessengerProfileButton,
});

Core.cms.register('friends-accepted-list-item', {
  component: props => {
    if (!props.payload?.user) return null;
    return (
      <Button
        variant={'link'}
        size={'sm'}
        onClick={() => {
          useMessengerStore.getState().openMessenger(props.payload?.user);
        }}
      >
        <MessageCircle />
      </Button>
    );
  },
});
