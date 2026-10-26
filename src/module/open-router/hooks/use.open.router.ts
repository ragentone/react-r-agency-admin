import { useAuth } from '@core/auth';
import type {
  IOpenRouterChannelEvents,
  IOpenRouterRequestResult,
} from '@module/open-router/types.ts';
import {
  type IWebSocketChannel,
  type IWsCTRLResult,
  useMesh,
} from 'r-agency-mesh-client-v1/release';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { IOpenRouter, OpenRouterRequestFn, OpenRouterSessions } from './types.ts';

export const useOpenRouter = (): IOpenRouter => {
  const { i18n, t } = useTranslation('open-router');
  const { websocket } = useMesh();
  const { userMeta } = useAuth();

  const [sessions, setSessions] = useState<OpenRouterSessions>({});
  const [loading, setLoading] = useState(false);
  const channelsRef = useRef<Map<string, IWebSocketChannel<IOpenRouterChannelEvents>>>(new Map());
  const timeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const clearSessionTimeout = useCallback((sessionId: string) => {
    const timer = timeoutsRef.current.get(sessionId);
    if (timer) {
      clearTimeout(timer);
      timeoutsRef.current.delete(sessionId);
    }
  }, []);

  const subscribeToChannel = useCallback(
    (channelName: string, sessionId?: string) => {
      if (channelsRef.current.has(channelName)) return;

      const ch = websocket.channel<IOpenRouterChannelEvents>(channelName);
      channelsRef.current.set(channelName, ch);

      ch.on('initialize', ({ payload }) => {
        setSessions(prev => ({
          ...prev,
          [payload.id]: { id: payload.id, deltas: [], end: false },
        }));
      });

      ch.on('chunk', ({ payload }) => {
        setSessions(prev => {
          const current = prev[payload.id] || { id: payload.id, deltas: [], end: false };
          return {
            ...prev,
            [payload.id]: {
              ...current,
              deltas: [...current.deltas, payload.delta],
            },
          };
        });
      });

      ch.on('end', ({ payload }) => {
        if (payload.id) {
          clearSessionTimeout(payload.id);
        }
        if (sessionId) {
          clearSessionTimeout(sessionId);
        }
        setSessions(prev => {
          const current = prev[payload.id];
          return {
            ...prev,
            [payload.id]: current ? { ...current, end: true } : { id: payload.id, deltas: [], end: true },
          };
        });
        setLoading(false);
      });

      ch.on('error', ({ payload }) => {
        const targetId = sessionId || payload.id || '';
        if (targetId) {
          clearSessionTimeout(targetId);
        }
        setSessions(prev => {
          const current = prev[targetId] || { id: targetId, deltas: [], end: true };
          return {
            ...prev,
            [targetId || current.id]: {
              ...current,
              end: true,
              error: payload.error,
            },
          };
        });
        setLoading(false);
      });
    },
    [clearSessionTimeout, websocket]
  );

  const request: OpenRouterRequestFn = useCallback(
    options => {
      setLoading(true);
      try {
        websocket
          .payload()
          .controller('open-router')
          .action('request', {
            data: { messages: options.messages, userId: userMeta?.id, language: i18n.language },
            onResponse: (result: IWsCTRLResult<IOpenRouterRequestResult>) => {
              if (result.data) {
                const reqId = result.data.id;
                if (result.data.channel) {
                  subscribeToChannel(result.data.channel, reqId);
                }
                if (reqId) {
                  setSessions(prev => ({
                    ...prev,
                    [reqId]: prev[reqId] || { id: reqId, deltas: [], end: false },
                  }));

                  // Set a 60s safety timeout in case stream never completes
                  const timer = setTimeout(() => {
                    setSessions(prev => {
                      const cur = prev[reqId];
                      if (cur && !cur.end) {
                        return {
                          ...prev,
                          [reqId]: {
                            ...cur,
                            end: true,
                            error: cur.deltas.length > 0 ? undefined : t('noResponse', { defaultValue: 'Keine Antwort' }),
                          },
                        };
                      }
                      return prev;
                    });
                    setLoading(false);
                  }, 60000);

                  timeoutsRef.current.set(reqId, timer);
                }
                if (options.onResponse) {
                  options.onResponse(result.data);
                }
                if (!result.data.success) {
                  setLoading(false);
                }
              } else {
                setLoading(false);
              }
            },
          })
          .send();
      } catch {
        setLoading(false);
      }
    },
    [i18n.language, subscribeToChannel, t, userMeta?.id, websocket]
  );

  useEffect(() => {
    return () => {
      channelsRef.current.forEach(ch => ch.destroy());
      channelsRef.current.clear();
      timeoutsRef.current.forEach(timer => clearTimeout(timer));
      timeoutsRef.current.clear();
    };
  }, []);

  return useMemo<IOpenRouter>(() => {
    return {
      request,
      loading,
      sessions,
    };
  }, [loading, request, sessions]);
};
