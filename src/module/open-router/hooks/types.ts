import type {
  IOpenRouterDelta,
  IOpenRouterMessage,
  IOpenRouterRequestResult,
} from '@module/open-router/types.ts';

export interface IOpenRouterRequestOptions {
  messages: IOpenRouterMessage[];
  onResponse?: (result: IOpenRouterRequestResult) => void;
}

export type OpenRouterRequestFn = (options: IOpenRouterRequestOptions) => void;

export interface IOpenRouter {
  request: OpenRouterRequestFn;
  loading: boolean;
  sessions: OpenRouterSessions;
}

export interface IOpenRouterSession {
  id: string;
  deltas: IOpenRouterDelta[];
  end: boolean;
  error: any;
}

export type OpenRouterSessions = Record<string, IOpenRouterSession>;
