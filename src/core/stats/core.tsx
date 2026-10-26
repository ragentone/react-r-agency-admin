import { Core } from '@core/core.api.ts';

import { StatsTracker } from './components/StatsTracker';

// Page views → runtime shared/stats (admin: /admin/stats).
Core.extension.add({ component: StatsTracker, sortOrder: 200 });
