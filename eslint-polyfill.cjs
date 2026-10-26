// Polyfill for structuredClone in Node.js versions that don't support it
if (typeof globalThis.structuredClone !== 'function') {
  globalThis.structuredClone = function structuredClone(obj) {
    // Handle null or undefined
    if (obj === null || obj === undefined) {
      return obj;
    }

    // Create a WeakMap to handle circular references
    const map = new WeakMap();

    function _clone(obj) {
      // Handle primitive types
      if (typeof obj !== 'object' && typeof obj !== 'function') {
        return obj;
      }

      // Handle Date
      if (obj instanceof Date) {
        return new Date(obj);
      }

      // Handle RegExp
      if (obj instanceof RegExp) {
        return new RegExp(obj);
      }

      // Handle Map
      if (obj instanceof Map) {
        const mapClone = new Map();
        obj.forEach((value, key) => {
          mapClone.set(_clone(key), _clone(value));
        });
        return mapClone;
      }

      // Handle Set
      if (obj instanceof Set) {
        const setClone = new Set();
        obj.forEach(value => {
          setClone.add(_clone(value));
        });
        return setClone;
      }

      // Handle Arrays
      if (Array.isArray(obj)) {
        return obj.map(item => _clone(item));
      }

      // Handle circular references
      if (map.has(obj)) {
        return map.get(obj);
      }

      // Skip non-cloneable objects like functions
      if (typeof obj === 'function') {
        return obj;
      }

      // Handle Objects
      const result = {};
      map.set(obj, result);

      Object.keys(obj).forEach(key => {
        result[key] = _clone(obj[key]);
      });

      return result;
    }

    return _clone(obj);
  };
}
