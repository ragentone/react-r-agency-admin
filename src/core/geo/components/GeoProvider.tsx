import { LocationReverseQuery } from '@core/geo/graphql';
import { useMesh } from 'r-agency-mesh-client-v1/release';
import { type ReactNode, useCallback, useEffect, useMemo, useState } from 'react';

import type { IGeoLocationReverse } from '../types/reverse.ts';
import { GeoContext, type IGeoContext } from './geo.context.ts';

interface IProps {
  children: ReactNode;
}

const GeoProvider = ({ children }: IProps) => {
  const { graphql } = useMesh();
  const [granted, setGranted] = useState(false);
  const [cords, setCords] = useState<GeolocationCoordinates | undefined>(undefined);
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [reverse, setReverse] = useState<IGeoLocationReverse | undefined>(undefined);

  const getCords = useCallback(async () => {
    return new Promise<GeolocationCoordinates | undefined>(resolve => {
      if (!granted) {
        return resolve(undefined);
      }
      setLoading(true);
      window.navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          setCords(coords);
          setLoading(false);
          resolve(coords);
        },
        ({ message }) => {
          setError(message);
          setHasError(true);
          setLoading(false);
          resolve(undefined);
        }
      );
    });
  }, [granted]);

  const load = useCallback(
    async (cords: GeolocationCoordinates) => {
      const { data } = await graphql().query({
        query: LocationReverseQuery,
        variables: {
          lat: cords.latitude.toString(),
          lon: cords.longitude.toString(),
          save: false,
        },
      });
      setReverse({
        address: data?.locationReverse?.address ?? undefined,
      });
    },
    [graphql]
  );

  const contextValue = useMemo<IGeoContext>(() => {
    return {
      granted,
      cords,
      hasError,
      error,
      getCords,
      loading,
      reverse,
    };
  }, [cords, error, getCords, granted, hasError, loading, reverse]);

  useEffect(() => {
    const init = () => {
      window.navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          setCords(coords);
          setGranted(true);
        },
        ({ message }) => {
          setError(message);
          setHasError(true);
        }
      );
    };
    init();
  }, []);

  useEffect(() => {
    const init = () => {
      if (!cords) return;
      void load(cords);
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cords]);

  return <GeoContext.Provider value={contextValue}>{children}</GeoContext.Provider>;
};

export { GeoProvider };
