import { EventManager } from '@core/event/event.manager.ts';
import type { IEvents } from '@core/event/types.ts';
import type { ICoreEventMap, ICustomEventMap } from 'event/global';

/**
 * A boolean flag indicating whether the application is in debug mode.
 * When set to true, the application may log additional diagnostic or
 * debugging information to assist developers in troubleshooting.
 */
const DEBUG = false;
/**
 * An object representing a collection of event managers categorized into core and custom events.
 */
const Events: IEvents = {
  core: new EventManager<ICoreEventMap>({ debug: DEBUG }),
  custom: new EventManager<ICustomEventMap>({ debug: DEBUG }),
};

export { Events };
