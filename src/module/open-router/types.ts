export type OpenRouterDeltaRole = 'developer' | 'system' | 'user' | 'assistant' | 'tool';

export interface IOpenRouterMessage {
  role: OpenRouterDeltaRole;
  content: string;
}

export interface IOpenRouterChannelEvents {
  chunk: {
    delta: IOpenRouterDelta;
    id: string;
  };
  initialize: {
    id: string;
    model: string;
  };
  end: {
    id: string;
  };
}

export interface IOpenRouterDelta {
  content: string;
  role: OpenRouterDeltaRole;
}

export interface IOpenRouterRequestResult {
  id?: string;
  channel?: string;
  success: boolean;
}
