import { createContext } from 'react';

import type { IPwaContext } from '../types';

export const PwaContext = createContext<IPwaContext | undefined>(undefined);
