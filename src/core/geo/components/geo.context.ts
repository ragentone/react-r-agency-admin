import type { IGeoLocationReverse } from '@core/geo/types';
import { createContext } from 'react';

export interface IGeoContext {
  granted: boolean;
  cords: GeolocationCoordinates | undefined;
  hasError: boolean;
  error: string | undefined;
  getCords: () => Promise<GeolocationCoordinates | undefined>;
  loading: boolean;
  reverse: IGeoLocationReverse | undefined;
}

export const GeoContext = createContext<IGeoContext | undefined>(undefined);
