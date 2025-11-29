export interface VapiMessage {
  role: 'user' | 'assistant';
  text: string;
  timestamp?: Date;
}

export interface VapiConfig {
  apiKey: string;
  assistantId: string;
  config?: Record<string, unknown>;
}

