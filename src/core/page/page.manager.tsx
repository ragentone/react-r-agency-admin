import { EmptyPage } from '@core/page/EmptyPage.tsx';
import type { IRouterPageProps } from '@router/components';
import type { FunctionComponent } from 'react';

import type { IPageManager, PageType } from './types.ts';

/**
 * A mapping object that associates specific page types with their respective
 * React functional components. Each entry in the object corresponds to a
 * `PageType` key and the associated functional component that renders the
 * page, receiving `IRouterPageProps` as its props.
 *
 * This object uses a partial record structure, meaning not all possible
 * PageType values need to be present. It allows for flexibility in defining
 * pages that are available at runtime.
 *
 * @type {Partial<Record<PageType, FunctionComponent<IRouterPageProps>>>}
 */
const __pages__: Partial<Record<PageType, FunctionComponent<IRouterPageProps>>> = {};
/**
 * Sets the default page for a specified page type.
 * This function assigns a React functional component to a specific page type,
 * which can later be used as the default renderer for that type.
 * @param {PageType} type - The type of the page to set the default for.
 * @param {FunctionComponent<IRouterPageProps>} page - The React functional component
 * representing the default page for the given type.
 */
const setDefaultPage = (type: PageType, page: FunctionComponent<IRouterPageProps>) => {
  __pages__[type] = page;
};
/**
 * Retrieves the default page component for a given page type.
 * This function takes a page type as input and returns the corresponding
 * default page component if it exists. If no matching page component is found,
 * it returns undefined.
 * @param {PageType} type - The type of the page to retrieve.
 * @returns {FunctionComponent<IRouterPageProps> | undefined} The default page
 * component corresponding to the provided type, or undefined if no matching
 * component is defined.
 */
const getDefaultPage = (type: PageType): FunctionComponent<IRouterPageProps> => {
  return __pages__[type] ?? EmptyPage;
};

/**
 * Represents the manager for handling page-related operations within the application.
 * This object provides methods to set and retrieve the current page state.
 */
const PageManager: IPageManager = {
  setPage: setDefaultPage,
  getPage: getDefaultPage,
  hasPage: (type: PageType) => __pages__[type] !== undefined,
};

export { PageManager };
