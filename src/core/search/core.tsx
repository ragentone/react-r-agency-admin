import { Core } from '@core/core.api.ts';
import { ProviderManager } from '@core/provider';
import { Search } from 'lucide-react';

import { SearchProvider } from './components/SearchProvider';
import { SearchManager } from './manager';

// Global search dialog + shortcuts (inside the router → back button closes it).
ProviderManager.add({
  alias: 'search',
  target: 'route',
  sortOrder: 5,
  config: { provider: SearchProvider },
});

// Dock: search button (opens the dialog) – right after the dropdown menu.
Core.dock.register({
  id: 'search',
  label: 'search:title',
  icon: Search,
  onClick: () => SearchManager.open(),
  align: 'right',
  sortOrder: 1,
});
