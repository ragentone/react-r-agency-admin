import { parse } from 'graphql';

/* Parsed here instead of codegen `graphql()` (works before Vite saw the new operation). */

/** The one shop as list of 0 or 1 entries. */
export const ShopGetQuery = parse(`
  query ShopGet {
    shopGet {
      success
      shops
    }
  }
`);

/** Sets up or edits the one shop – administrators only. */
export const ShopSaveMutation = parse(`
  mutation ShopSave($values: JSON!, $logoFile: [Upload], $bannerFile: [Upload]) {
    shopSave(values: $values, logoFile: $logoFile, bannerFile: $bannerFile) {
      success
      shops
    }
  }
`);
