import { Core } from '@core/core.api.ts';

import { SeoManager } from './components/SeoManager';

// `<head>` per page → runtime shared/seo (admin: /admin/seo).
Core.extension.add({ component: SeoManager, sortOrder: 210 });
