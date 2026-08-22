import type { ChatMessage, ProviderKind } from "../book/types.ts";

export interface CompleteRequest {
  provider: ProviderKind;
  model: string;
  temperature: number;
  maxTokens: number;
  messages: ChatMessage[];
  baseUrl?: string;
  apiKey?: string;
  headers?: Record<string, string>;
}

export interface CompleteResult {
  ok: true;
  text: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface CompleteError {
  ok: false;
  error: string;
  code?: "auth" | "rate" | "timeout" | "network" | "model" | "invalid" | "unavailable";
  retryable: boolean;
}

export type CompleteResponse = CompleteResult | CompleteError;

export const COST_PER_MILLION = {
  input: 3,
  output: 15,
};

export function estimateCostUsd(inputTokens: number, outputTokens: number): number {
  return (inputTokens / 1_000_000) * COST_PER_MILLION.input +
    (outputTokens / 1_000_000) * COST_PER_MILLION.output;
}

export function friendlyAiError(status: number, body: string): CompleteError {
  if (status === 401 || status === 403) {
    return {
      ok: false,
      error: "The API key was rejected. Check the key and try again.",
      code: "auth",
      retryable: false,
    };
  }
  if (status === 429) {
    return {
      ok: false,
      error: "The model is rate-limited right now. Wait a moment and retry.",
      code: "rate",
      retryable: true,
    };
  }
  if (status === 404) {
    return {
      ok: false,
      error: "That model is not available on this endpoint.",
      code: "model",
      retryable: false,
    };
  }
  if (status >= 500) {
    return {
      ok: false,
      error: "The model provider had a server error. Retry in a moment.",
      code: "unavailable",
      retryable: true,
    };
  }
  const snippet = body.replace(/sk-[a-zA-Z0-9]+/g, "[redacted]").slice(0, 180);
  return {
    ok: false,
    error: snippet || `The provider returned HTTP ${status}.`,
    code: "invalid",
    retryable: status >= 500,
  };
}
