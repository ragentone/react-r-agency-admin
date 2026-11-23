/** Shop management – only users with `shop:admin:user` (the `_admin` layout also needs `admin:user`). */
export const ADMIN_SHOP_ROUTE = '/admin/shop';
export const ADMIN_SHOP_ITEM_NEW_ROUTE = '/admin/shop/items/new';
export const ADMIN_SHOP_ITEM_ROUTE = '/admin/shop/items/$itemId';
export const ADMIN_SHOP_ROLES = 'shop:admin:user';

export const SHOP_ITEM_IMAGES_MAX = 6;
export const SHOP_IMAGE_MAX_SIZE = 10 * 1024 * 1024;
export const SHOP_NAME_MAX = 80;
export const SHOP_DESCRIPTION_MAX = 1000;
export const SHOP_ITEM_TITLE_MAX = 80;
export const SHOP_ITEM_DESCRIPTION_MAX = 20000;
export const SHOP_ITEM_DURATION_MAX = 40;
export const SHOP_REQUEST_MESSAGE_MAX = 1000;
/** Image workflow: longest edge and quality of the compressed image. */
export const SHOP_IMAGE_MAX_DIMENSION = 2048;
export const SHOP_IMAGE_QUALITY = 0.82;
export const SHOP_CATEGORY_NAME_MAX = 60;
