import type { IExtension, IExtensionOptions } from './types.ts';

/**
 * Represents a collection of application extensions used to enhance
 * or extend the functionality of the application.
 *
 * This variable is expected to hold an array of extension objects
 * conforming to the IExtension interface.
 *
 * The extensions stored in this array may define custom behaviors,
 * integrations, or additional features that can be plugged into the
 * core application.
 *
 * The array is initialized as empty and may be populated during
 * application initialization or dynamically at runtime.
 *
 * @type {IExtension[]}
 */
export const __application__extensions__: IExtension[] = [];
/**
 * Registers a new extension into the application extensions registry.
 *
 * @param {IExtensionOptions} options - Configuration object for the new extension.
 * @param {React.Component} options.component - The React component representing the extension.
 * @param {number} [options.sortOrder=0] - Optional sort order for the extension, default is 0.
 * @param {boolean} [options.active=true] - Optional flag indicating whether the extension is active, default is true.
 */
const addExtension = (options: IExtensionOptions) => {
  // Same component again (hot reload re-runs the registering module) → replace.
  const name = options.component.name;
  const existing = name
    ? __application__extensions__.findIndex(extension => extension.component.name === name)
    : -1;
  if (existing >= 0) __application__extensions__.splice(existing, 1);
  __application__extensions__.push({
    component: options.component,
    sortOrder: options.sortOrder ?? 0,
    active: options.active ?? true,
    mounted: false,
  });
};

/**
 * An object responsible for managing extensions.
 * Provides methods for adding new extensions and interacting with them.
 * @property {Function} add - A method for adding a new extension.
 */
const ExtensionManager = {
  add: addExtension,
};

export { ExtensionManager };
