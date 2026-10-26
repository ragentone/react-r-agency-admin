import { parse } from 'graphql';

import type { ISeoConfig } from './types';

/* Parsed here instead of codegen `graphql()` (works before Vite saw the new operation). */
export const SeoConfigQuery = parse(`
  query SeoConfig {
    seoConfig { success error settings routes }
  }
`);

export interface ISeoConfigResult extends Partial<ISeoConfig> {
  success?: boolean;
  error?: string | null;
}
