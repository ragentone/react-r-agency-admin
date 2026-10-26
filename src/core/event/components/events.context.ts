import type { IEvents } from '@core/event/types.ts';
import { createContext } from 'react';

export interface IEventContext extends IEvents {
  mounted: boolean;
}

export const EventsContext = createContext<IEventContext | undefined>(undefined);
