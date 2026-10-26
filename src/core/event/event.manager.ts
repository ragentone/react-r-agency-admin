import { EventArgs } from '@core/event/event.args.ts';
import type {
  EventCollection,
  EventDefaultMap,
  EventHandlerFn,
  EventOffHandler,
  EventOnErrorFn,
  IEventArgs,
  IEventArgsInt,
  IEventAware,
  IEventEmitOptions,
  IEventError,
  IEventManager,
  IEventManagerOptions,
  IEventOptions,
} from '@core/event/types.ts';
import ShortUniqueId from 'short-unique-id';

/**
 * The EventManager class is responsible for handling and managing events
 * within the system. It enables registering event listeners, emitting events,
 * and managing event data through a collection.
 * It provides a flexible mechanism for defining event types and their respective handlers,
 * offering fine-grained control over event-driven operations.
 * @template Map A map that defines the default event structure, extending from the EventDefaultMap.
 * @implements {IEventManager<Map>}
 */
export class EventManager<
  EventMap extends EventDefaultMap = EventDefaultMap,
> implements IEventManager<EventMap> {
  /**
   * A unique identifier generator instance for creating short, unique IDs.
   * Utilizes the ShortUniqueId library to generate identifiers that can be
   * used in scenarios requiring compact, collision-resistant strings.
   * The generated IDs are suitable for use in databases, UUID substitution,
   * or as identifiers for application components.
   */
  private readonly _uuid = new ShortUniqueId();
  /**
   * A collection of events stored as key-value pairs.
   * The keys in the collection represent unique event identifiers or names,
   * while the values correspond to the associated event details or handlers.
   *
   * This collection is implemented as a Map, providing efficient storage
   * and retrieval of event-related data.
   *
   * Use this variable to register, store, and manage event information
   * in the system.
   *
   * @type {Map}
   */
  private readonly _collection: EventCollection<EventMap> = new Map();
  /**
   * Configuration options for the IEventManager.
   * Use these options to customize the behavior of the event manager.
   */
  private readonly options: Omit<IEventManagerOptions, 'onError'>;
  /**
   * An array of error handling functions that will be triggered
   * when an error event occurs. Each function in the array adheres
   * to the `EventOnErrorFn` type, which defines the interface for
   * handling error events.
   */
  private readonly errorHandlers: EventOnErrorFn[] = [];

  /**
   * Constructs a new instance of the EventManager..
   */
  constructor(options: IEventManagerOptions = {}) {
    if (options.onError) {
      this.errorHandlers.push(options.onError);
    }
    this.options = options;
  }

  /**
   * Registers an error handler function to be invoked when an error occurs.
   * @param {EventOnErrorFn} fn - The callback function to handle errors.
   */
  onError(fn: EventOnErrorFn): void {
    this.errorHandlers.push(fn);
  }
  /**
   * Registers an event listener for the specified event type.
   * @param {Key} event - The name of the event to listen for.
   * @param fn
   * @param {IEventOptions} [options] - Optional settings for the event listener.
   * @return {void}
   */
  on<Key extends keyof EventMap>(
    event: Key,
    fn: EventHandlerFn<EventMap[Key]['payload'], EventMap[Key]['data']>,
    options?: IEventOptions
  ): EventOffHandler {
    const eventId = this._uuid.rnd(16);
    const events = this._collection.get(event) ?? [];

    const eventNew: IEventAware = {
      id: eventId,
      once: options?.once ?? false,
      priority: options?.priority ?? 0,
      stopOnError: options?.stopOnError ?? false,
      fn: fn,
    };

    events.push(eventNew);
    this._collection.set(event, events);

    return () => this.off(event, eventNew.id);
  }

  /**
   * Removes a specific event listener by its identifier for the given event name.
   * @param {Key} event - The name of the event to remove the listener from.
   * @param {string} id - The unique identifier of the listener to be removed.
   * @return {void} Nothing is returned from this method.
   */
  off<Key extends keyof EventMap>(event: Key, id: string): void {
    const events = this._collection.get(event) ?? [];
    const index = events.findIndex(e => e.id === id);
    if (index === -1) return;
    events.splice(index, 1);
  }

  /**
   * Emits an event of the specified type, executing all associated event handlers.
   */
  emit<Key extends keyof EventMap>(
    event: Key,
    options: IEventEmitOptions<EventMap[Key]['payload']> = {}
  ): Promise<IEventArgs<EventMap[Key]['payload'], EventMap[Key]['data']>> {
    return new Promise(resolve => {
      const args = new EventArgs<EventMap[Key]['payload'], EventMap[Key]['data']>(options.payload);
      const events = this.getEvents(event);

      if (events.length === 0) return resolve(args);

      const next = (index: number = 0) => {
        if (args.isPrevented()) {
          return resolve(args);
        }

        const aware = events[index];
        if (!aware) return resolve(args);

        if (aware.once) {
          this.off(event, aware.id);
        }

        try {
          if (this.options.debug) {
            console.log(`Emit event: ${event.toString()}, index: ${index}`);
          }
          aware.fn(args).then(() => {
            args.setIndex(index);
            next(index + 1);
          });
        } catch (e) {
          const error = e as Error;
          this.handleError(args, aware, error);
          if (aware.stopOnError) {
            return resolve(args);
          }
          args.setIndex(index);
          next(index + 1);
        }
      };

      next();
    });
  }

  /**
   * Retrieves a sorted array of event-aware objects based on their priority.
   * @param {string} event - The name of the event to retrieve and sort.
   * @return {IEventAware[]} A sorted array of objects implementing the IEventAware interface. If no events are found, an empty array is returned.
   */
  private getEvents<Key extends keyof EventMap>(event: Key): IEventAware[] {
    const events = this._collection.get(event);
    if (!events) {
      return [];
    }
    return [...events].sort((a, b) => b.priority - a.priority);
  }

  /**
   * Handles errors encountered during event processing, logs them, and invokes the provided error callback if available.
   * @param {IEventArgsInt} args - The event arguments containing information about the current event.
   * @param {IEventAware} aware - The object that is aware of the event being processed.
   * @param {Error} error - The error object that contains details of the error encountered.
   */
  private handleError(args: IEventArgsInt, aware: IEventAware, error: Error) {
    const eventError: IEventError = {
      eventId: aware.id,
      eventIndex: args.index(),
      message: error.message,
      name: error.name,
      stack: error.stack,
    };

    this.errorHandlers.forEach(handler => handler(eventError));

    if (aware.onError) {
      aware.onError(eventError);
    }
    args.addError(eventError);
  }
}
