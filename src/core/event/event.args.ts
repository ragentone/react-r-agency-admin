// noinspection JSValidateJSDoc

import type {
  EventDefaultData,
  EventDefaultPayload,
  IEventArgsInt,
  IEventError,
} from '@core/event/types.ts';

/**
 * A generic class used for transmitting event data.
 * This class can be used to encapsulate and pass event-specific data
 * across various parts of the application or between systems.
 * @template Payload - A record that defines the shape of the event payload data.
 */
export class EventArgs<
  Payload extends EventDefaultPayload = EventDefaultPayload,
  Data extends EventDefaultData = EventDefaultData,
> implements IEventArgsInt<Payload, Data> {
  /**
   * Represents a collection of event errors.
   * This variable stores an array of `IEventError` objects, where each object
   * encapsulates details about a specific error related to events.
   * The array is initialized as empty and can be populated with error instances
   * that conform to the `IEventError` interface.
   * Use this variable to track and handle errors occurring in the context of
   * event processing or management.
   */
  public errors: IEventError[] = [];
  /**
   * A boolean flag indicating whether the default action of an event should be prevented.
   * When set to true, event handlers may use this variable to determine if the default
   * browser behavior for an event should be suppressed.
   */
  private _preventDefault: boolean = false;
  /**
   * Represents the current index or position within a collection, sequence,
   * or iteration. Typically used to track the active or starting point in
   * zero-based indexing systems.
   * @type {number}
   */
  private _index: number = 0;
  /**
   * Represents the payload object used for data transmission or storage.
   * This object typically contains the data and its associated metadata that
   * is passed between different parts of the application or an external system.
   */
  public readonly payload: Payload;
  /**
   * Represents additional event data.
   */
  public data: Data;
  /**
   * Creates an instance of the class with the specified payload.
   */
  constructor(_payload: Payload, _data: Data = {} as Data) {
    this.payload = _payload ?? ({} as Payload);
    this.data = _data;
  }

  /**
   * Adds an error to the errors collection.
   * @param {IEventError} error - The error object to be added.
   * @return {void} No value is returned.
   */
  addError(error: IEventError): void {
    this.errors.push(error);
  }
  /**
   * Prevents the default action associated with an event by setting an internal flag.
   * Once invoked, the default action will be disabled.
   * @return {void} This method does not return any value.
   */
  preventDefault(): void {
    this._preventDefault = true;
  }

  /**
   * Checks if the default action has been prevented.
   * @return {boolean} True if the default action is prevented, otherwise false.
   */
  isPrevented(): boolean {
    return this._preventDefault;
  }

  /**
   * Assigns the provided partial data to the existing data, merging fields while preserving current values.
   * @param {Partial<Data>} data - The partial data object to be merged into the existing data.
   * @return {void} Updates the current data object with the provided partial data.
   */
  assign(data: Partial<Data>): void {
    this.data = { ...(this.data ?? {}), ...data } as Data;
  }

  /**
   * Retrieves the current value of the `_index` property.
   * @return {number} The value of the `_index` property.
   */
  index(): number {
    return this._index;
  }

  /**
   * Sets the index value for the current instance.
   * @param {number} index - The new index value to be set.
   * @return {void} No return value.
   */
  setIndex(index: number): void {
    this._index = index;
  }
}
