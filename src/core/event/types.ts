import type { ICoreEventMap, ICustomEventMap } from 'event/global';

export type EventDefaultMap = Record<string, any>;

export type EventDefaultPayload = any;
export type EventDefaultData = any;

export interface IEventError {
  eventId: string;
  eventIndex: number;
  message: string;
  name: string;
  stack: string | undefined;
}

export interface IEventArgs<
  Payload extends EventDefaultPayload = EventDefaultPayload,
  Data extends EventDefaultData = EventDefaultData,
> {
  payload: Payload;
  data: Data;
  errors: IEventError[];
  assign(data: Partial<Data>): void;
  index(): number;
  preventDefault(): void;
  isPrevented(): boolean;
}

export interface IEventArgsInt<
  Payload extends EventDefaultPayload = EventDefaultPayload,
  Data extends EventDefaultData = EventDefaultData,
> extends IEventArgs<Payload, Data> {
  setIndex(index: number): void;
  addError(error: IEventError): void;
}

export interface IEventOptions {
  once?: boolean;
  priority?: number;
  stopOnError?: boolean;
  onError?(error: IEventError): void;
}

export interface IEventAware {
  id: string;
  fn: EventHandlerFn<any, any>;
  once: boolean;
  priority: number;
  stopOnError: boolean;
  onError?(error: IEventError): void;
}

export type EventCollection<EventMap extends EventDefaultMap = EventDefaultMap> = Map<
  keyof EventMap,
  IEventAware[]
>;

export type EventOffHandler = () => void;
export type EventOnErrorFn = (error: IEventError) => void;

export type EventHandlerFn<
  Payload extends EventDefaultPayload = EventDefaultPayload,
  Data extends EventDefaultData = EventDefaultData,
> = (args: IEventArgs<Payload, Data>) => Promise<void>;

export interface IEventManagerOptions {
  debug?: boolean;
  onError?(error: IEventError): void;
}

export interface IEventEmitOptions<Payload extends EventDefaultPayload = EventDefaultPayload> {
  payload?: Payload;
}

export interface IEventManager<EventMap extends EventDefaultMap = EventDefaultMap> {
  /**
   * Registers a callback function to be invoked when an error event occurs.
   * @param {EventOnErrorFn} fn - The callback function to execute when an error is caught.
   *                              It receives error-related information as arguments.
   * @return {void} Does not return a value.
   */
  onError(fn: EventOnErrorFn): void;
  /**
   * Adds an event listener for the specified event type.
   * @param {Key} event - The name of the event to listen for.
   * @param {EventHandlerFn<Map[Key]>} fn - The callback function to execute when the event is triggered.
   * @param {IEventOptions} [options] - Optional configuration options for the event listener.
   * @return {void} This method does not return a value.
   */
  on<Key extends keyof EventMap>(
    event: Key,
    fn: EventHandlerFn<EventMap[Key]['payload'], EventMap[Key]['data']>,
    options?: IEventOptions
  ): EventOffHandler;

  emit<Key extends keyof EventMap>(
    event: Key,
    options?: IEventEmitOptions<EventMap[Key]['payload']>
  ): Promise<IEventArgs<EventMap[Key]['payload'], EventMap[Key]['data']>>;

  /**
   * A function or handler used to remove or deregister an event listener.
   * Typically employed to stop listening to an event or to clean up resources.
   */
  off<Key extends keyof EventMap>(event: Key, id: string): void;
}

/**
 * Interface representing the structure of event managers for different types of events.
 */
export interface IEvents {
  core: IEventManager<ICoreEventMap>;
  custom: IEventManager<ICustomEventMap>;
}
