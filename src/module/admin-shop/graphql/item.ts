import { parse } from 'graphql';

export const ShopItemListQuery = parse(`
  query ShopItemList($shopId: ID, $kind: String, $search: String, $page: Int) {
    shopItemList(shopId: $shopId, kind: $kind, search: $search, page: $page) {
      success
      items
      hasMore
    }
  }
`);

export const ShopItemLoadQuery = parse(`
  query ShopItemLoad($id: ID!) {
    shopItemLoad(id: $id) {
      success
      items
    }
  }
`);

export const ShopItemSaveMutation = parse(`
  mutation ShopItemSave(
    $shopId: ID!
    $id: ID
    $values: JSON!
    $imageFiles: [Upload]
    $removeImageIds: [String]
    $imageOrder: [String]
  ) {
    shopItemSave(
      shopId: $shopId
      id: $id
      values: $values
      imageFiles: $imageFiles
      removeImageIds: $removeImageIds
      imageOrder: $imageOrder
    ) {
      success
      items
    }
  }
`);

export const ShopItemDeleteMutation = parse(`
  mutation ShopItemDelete($id: ID!) {
    shopItemDelete(id: $id) {
      success
    }
  }
`);
