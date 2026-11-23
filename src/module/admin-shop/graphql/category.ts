import { parse } from 'graphql';

export const ShopCategoryListQuery = parse(`
  query ShopCategoryList($shopId: ID!) {
    shopCategoryList(shopId: $shopId) {
      success
      items
    }
  }
`);

export const ShopCategorySaveMutation = parse(`
  mutation ShopCategorySave($shopId: ID!, $id: ID, $name: String!) {
    shopCategorySave(shopId: $shopId, id: $id, name: $name) {
      success
      items
    }
  }
`);

export const ShopCategoryDeleteMutation = parse(`
  mutation ShopCategoryDelete($id: ID!) {
    shopCategoryDelete(id: $id) {
      success
      items
    }
  }
`);
