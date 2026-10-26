import { graphql } from '@generated/graphql';

const LocationReverseQuery = graphql(`
  query LocationReverse($lat: String!, $lon: String!, $save: Boolean) {
    locationReverse(lat: $lat, lon: $lon, save: $save) {
      success
      properties
      geometry
      type
      address
    }
  }
`);

export { LocationReverseQuery };
