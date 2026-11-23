/** Shop management – only `admin:user` (route guard `_admin` + runtime `shop` services). */
export const ADMIN_SHOP_ROUTE = '/admin/shop';
export const ADMIN_SHOP_ROLES = 'admin:user';

export const SHOP_ITEM_IMAGES_MAX = 6;
export const SHOP_IMAGE_MAX_SIZE = 10 * 1024 * 1024;
export const SHOP_NAME_MAX = 80;
export const SHOP_DESCRIPTION_MAX = 1000;
export const SHOP_ITEM_TITLE_MAX = 80;
export const SHOP_ITEM_DESCRIPTION_MAX = 2000;
export const SHOP_ITEM_DURATION_MAX = 40;
export const SHOP_REQUEST_MESSAGE_MAX = 1000;
/** Image workflow: longest edge and quality of the compressed image. */
export const SHOP_IMAGE_MAX_DIMENSION = 2048;
export const SHOP_IMAGE_QUALITY = 0.82;
