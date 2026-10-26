import { useGraphQl } from '@core/mesh';

type GraphQlClient = ReturnType<typeof useGraphQl>;
export type QueryDocument = Parameters<GraphQlClient['query']>[0]['query'];
export type MutationDocument = Parameters<GraphQlClient['mutate']>[0]['mutation'];

export const toError = (err: unknown) => (err instanceof Error ? err : new Error(String(err)));

/**
 * Known backend errors → translation keys (`admin:error.*`).
 * Order matters: `admin_role_protected_self` before `admin_role_protected`.
 */
const ERROR_KEYS: [needle: string, key: string][] = [
  ['admin_role_protected_self', 'error.protectedSelf'],
  ['admin_role_protected', 'error.protected'],
  ['admin_role_exists', 'error.exists'],
  ['admin_role_missing', 'error.missing'],
  ['admin_role_invalid', 'error.invalid'],
  ['user_update_role_not_allowed', 'error.superUser'],
  ['user_not_exists', 'error.userMissing'],
  ['not_authorized', 'error.notAuthorized'],
  // Dynamic pages (runtime apps/site-page)
  ['site_page_slug_exists', 'error.slugExists'],
  ['site_page_slug_invalid', 'error.slugInvalid'],
  ['site_page_title_required', 'error.titleRequired'],
  ['site_page_title_too_long', 'error.titleTooLong'],
  ['site_page_summary_too_long', 'error.summaryTooLong'],
  ['site_page_content_too_long', 'error.contentTooLong'],
  ['site_page_not_found', 'error.pageMissing'],
  ['site_page_menu_order_invalid', 'error.menuOrderInvalid'],
  ['site_page_visibility_invalid', 'error.accessInvalid'],
  ['site_page_roles_invalid', 'error.accessInvalid'],
  ['site_page_blocks_too_many', 'error.blocksTooMany'],
  ['site_page_block_items_too_many', 'error.blockItemsTooMany'],
  ['site_page_block_type_invalid', 'error.blocksInvalid'],
  ['site_page_blocks_invalid', 'error.blocksInvalid'],
  ['site_page_image_too_large', 'error.imageTooLarge'],
  ['site_page_image', 'error.imageUpload'],
  ['mime', 'error.imageType'],
];

export const errorKey = (errors: unknown, fallback = 'error.save'): string => {
  const text = errors instanceof Error ? errors.message : JSON.stringify(errors ?? '');
  return ERROR_KEYS.find(([needle]) => text.includes(needle))?.[1] ?? fallback;
};
