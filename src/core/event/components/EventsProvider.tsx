import { Events } from '@core/event/events.ts';
import { type ReactNode, useEffect, useState } from 'react';

import { EventsContext, type IEventContext } from './events.context.ts';

interface IProps {
  children: ReactNode;
}

const EventsProvider = ({ children }: IProps) => {
  const [mounted, setMounted] = useState(false);

  const contextValue: IEventContext = {
    core: Events.core,
    custom: Events.custom,
    mounted,
  };

  useEffect(() => {
    const init = () => {
      setMounted(true);
    };
    init();
  }, []);

  return <EventsContext.Provider value={contextValue}>{children}</EventsContext.Provider>;
};

export { EventsProvider };
