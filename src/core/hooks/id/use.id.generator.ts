import { useRef } from 'react';
import * as ShortUniqueId from 'short-unique-id';
import type { ShortUniqueIdOptions } from 'short-unique-id/dist/short-unique-id-core';

interface IOptions extends Partial<ShortUniqueIdOptions> {
  prefix?: string;
  suffix?: string;
}

/**
 * A custom hook that provides a unique ID generator function using a shortened character set.
 * This hook utilizes the "short-unique-id" library and generates IDs using only lowercase alphabetic characters.
 */
const useIdGenerator = (options: IOptions = {}) => {
  const uuid = useRef(new ShortUniqueId.default(options));
  return {
    rnd: (len: number = 8) => [options.prefix, uuid.current.rnd(len), options.suffix].join(''),
  };
};

export { useIdGenerator };
