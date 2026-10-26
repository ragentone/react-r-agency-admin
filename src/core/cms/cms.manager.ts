import type { CmsItemsCollection, ICmsManager, ICmsRegisterOptions } from '@core/cms/types.ts';
import type { ICmsContainerRegister } from 'cms/global';
import ShortUniqueId from 'short-unique-id';

/**
 * A mapping object that connects keys from the ICmsContainerRegister interface
 * to arrays of registered CMS components.
 * Each key in this object corresponds to a property on the ICmsContainerRegister
 * interface, and its value is an array of ICmsRegisteredComponent instances.
 * The Partial type indicates that not all keys of ICmsContainerRegister need
 * to be present in the object, and Record ensures that the type of each key is
 * consistent with the specified structure.
 * This variable serves as a registry for organizing CMS components,
 * allowing for flexible and efficient management of component collections
 * tied to specific container registers.
 */
const __components__: CmsItemsCollection = {};
/**
 * A unique identifier generator instance for creating short, unique IDs.
 * The instance is based on the ShortUniqueId library, which provides options
 * to generate random, non-sequential, and collision-resistant IDs.
 */
const uuid = new ShortUniqueId();
/**
 * CmsManager provides functionality to manage components within a Content Management System (CMS).
 * It allows for the registration and retrieval of components associated with specific containers.
 * The CmsManager object implements the ICmsManager interface containing the following methods:
 * - register: Registers a component for a specific container within the CMS.
 * - get: Retrieves all registered components for a specific container.
 */
const CmsManager: ICmsManager = {
  collection: __components__,
  register<Key extends keyof ICmsContainerRegister>(
    key: Key,
    options: ICmsRegisterOptions<ICmsContainerRegister[Key]>
  ): void {
    if (!__components__[key]) {
      __components__[key] = [];
    }
    const name = options.component.displayName || options.component.name;
    const id =
      options.id ??
      (name ? `${String(key)}:${name}:${options.position ?? 'before'}` : uuid.rnd(16));
    // Same id again (hot reload re-runs core.tsx / app.tsx) → replace instead of duplicating.
    const existing = __components__[key].findIndex(item => item.id === id);
    if (existing >= 0) __components__[key].splice(existing, 1);
    __components__[key].push({
      id,
      component: options.component,
      sortOrder: options.sortOrder ?? 0,
      disabled: options.disabled ?? false,
      position: options.position ?? 'before',
      async: options.async ?? false,
      animation: options.animation,
      style: options.style,
      loading: options.loading,
      classes: options.classes,
    });
  },
  // get<Key extends keyof ICmsContainerRegister>(
  //   key: Key,
  //   position: CmsItemPosition = 'before'
  // ): ICmsRegisteredItem[] {
  //   return (__components__[key] ?? [])
  //     .filter(item => !item.disabled)
  //     .filter(item => item.position === position)
  //     .sort((a, b) => a.sortOrder - b.sortOrder);
  // },
};

export { CmsManager };
