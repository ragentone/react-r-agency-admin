import { useEffect, useState } from 'react';

const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

type BreakpointKey = keyof typeof breakpoints;

export function useBreakpoints() {
  const [matches, setMatches] = useState<Record<BreakpointKey, boolean>>({
    sm: false,
    md: false,
    lg: false,
    xl: false,
    '2xl': false,
  });

  useEffect(() => {
    const mediaQueryLists = (Object.entries(breakpoints) as [BreakpointKey, string][]).reduce(
      (acc, [key, value]) => {
        acc[key] = window.matchMedia(`(min-width: ${value})`);
        return acc;
      },
      {} as Record<BreakpointKey, MediaQueryList>
    );

    const updateMatches = () => {
      setMatches({
        sm: mediaQueryLists.sm.matches,
        md: mediaQueryLists.md.matches,
        lg: mediaQueryLists.lg.matches,
        xl: mediaQueryLists.xl.matches,
        '2xl': mediaQueryLists['2xl'].matches,
      });
    };

    updateMatches();

    const handlers = (Object.entries(mediaQueryLists) as [BreakpointKey, MediaQueryList][]).map(
      ([key, mql]) => {
        const listener = () => {
          setMatches(prev => ({ ...prev, [key]: mql.matches }));
        };
        mql.addEventListener('change', listener);
        return { mql, listener };
      }
    );

    return () => {
      handlers.forEach(({ mql, listener }) => {
        mql.removeEventListener('change', listener);
      });
    };
  }, []);

  return matches;
}
