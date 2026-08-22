import type { CompleteRequest, CompleteResponse } from "./types";
import { friendlyAiError } from "./types";

const DEFAULT_XAI = "https://api.x.ai/v1";

function sanitize(text: string, secrets: string[]): string {
  let out = text;
  for (const s of secrets) {
    if (s && s.length > 4) out = out.split(s).join("[redacted]");
  }
  return out;
}

function resolveEndpoint(req: CompleteRequest): {
  url: string;
  apiKey: string;
  headers: Record<string, string>;
  error?: CompleteResponse;
} {
  const secrets: string[] = [];
  if (req.provider === "xai") {
    const apiKey = process.env.XAI_API_KEY ?? "";
    if (!apiKey) {
      return {
        url: "",
        apiKey: "",
        headers: {},
        error: {
          ok: false,
          error: "Grok is not available in this environment. Add your own API in Engine settings.",
          code: "unavailable",
          retryable: false,
        },
      };
    }
    secrets.push(apiKey);
    return {
      url: `${DEFAULT_XAI}/chat/completions`,
      apiKey,
      headers: { Authorization: `Bearer ${apiKey}` },
    };
  }

  const apiKey = req.apiKey ?? "";
  if (apiKey) secrets.push(apiKey);
  const base = (req.baseUrl || "").replace(/\/+$/, "");
  if (!base) {
    return {
      url: "",
      apiKey: "",
      headers: {},
      error: {
        ok: false,
        error: "A base URL is required for this provider.",
        code: "invalid",
        retryable: false,
      },
    };
  }
  const headers: Record<string, string> = { ...(req.headers ?? {}) };
  if (apiKey && !headers.Authorization && !headers.authorization) {
    headers.Authorization = `Bearer ${apiKey}`;
  }
  const url = base.endsWith("/chat/completions") ? base : `${base}/chat/completions`;
  return { url, apiKey, headers };
}

export async function completeChat(req: CompleteRequest): Promise<CompleteResponse> {
  const resolved = resolveEndpoint(req);
  if (resolved.error) return resolved.error;
  const secrets = [resolved.apiKey, req.apiKey ?? ""];

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 120_000);

  try {
    const res = await fetch(resolved.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...resolved.headers,
      },
      body: JSON.stringify({
        model: req.model || "grok-4.5",
        temperature: req.temperature,
        max_tokens: req.maxTokens,
        messages: req.messages,
        stream: false,
      }),
      signal: controller.signal,
    });

    const raw = await res.text();
    if (!res.ok) {
      return friendlyAiError(res.status, sanitize(raw, secrets));
    }
    let body: {
      choices?: { message?: { content?: string } }[];
      usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
    };
    try {
      body = JSON.parse(raw) as typeof body;
    } catch {
      return {
        ok: false,
        error: "The model returned a response that was not valid JSON.",
        code: "invalid",
        retryable: true,
      };
    }
    const text = body.choices?.[0]?.message?.content ?? "";
    if (!text.trim()) {
      return {
        ok: false,
        error: "The model returned an empty response. Try again with a shorter prompt.",
        code: "invalid",
        retryable: true,
      };
    }
    const promptTokens = body.usage?.prompt_tokens ?? 0;
    const completionTokens = body.usage?.completion_tokens ?? 0;
    return {
      ok: true,
      text,
      usage: {
        promptTokens,
        completionTokens,
        totalTokens: body.usage?.total_tokens ?? promptTokens + completionTokens,
      },
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Network error";
    if (message.toLowerCase().includes("abort")) {
      return {
        ok: false,
        error: "The model took too long to respond. Try a smaller section or retry.",
        code: "timeout",
        retryable: true,
      };
    }
    return {
      ok: false,
      error: sanitize(message, secrets) || "Could not reach the model.",
      code: "network",
      retryable: true,
    };
  } finally {
    clearTimeout(timer);
  }
}

export async function streamChat(
  req: CompleteRequest,
  onDelta: (chunk: string) => void,
): Promise<CompleteResponse> {
  const resolved = resolveEndpoint(req);
  if (resolved.error) return resolved.error;
  const secrets = [resolved.apiKey, req.apiKey ?? ""];
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 180_000);

  try {
    const res = await fetch(resolved.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...resolved.headers,
      },
      body: JSON.stringify({
        model: req.model || "grok-4.5",
        temperature: req.temperature,
        max_tokens: req.maxTokens,
        messages: req.messages,
        stream: true,
        stream_options: { include_usage: true },
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const raw = await res.text();
      return friendlyAiError(res.status, sanitize(raw, secrets));
    }
    if (!res.body) {
      return completeChat({ ...req });
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let text = "";
    let promptTokens = 0;
    let completionTokens = 0;
    let totalTokens = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const parts = buffer.split("\n");
      buffer = parts.pop() ?? "";
      for (const line of parts) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data:")) continue;
        const data = trimmed.slice(5).trim();
        if (data === "[DONE]") continue;
        try {
          const json = JSON.parse(data) as {
            choices?: { delta?: { content?: string } }[];
            usage?: {
              prompt_tokens?: number;
              completion_tokens?: number;
              total_tokens?: number;
            };
          };
          const delta = json.choices?.[0]?.delta?.content ?? "";
          if (delta) {
            text += delta;
            onDelta(delta);
          }
          if (json.usage) {
            promptTokens = json.usage.prompt_tokens ?? promptTokens;
            completionTokens = json.usage.completion_tokens ?? completionTokens;
            totalTokens = json.usage.total_tokens ?? totalTokens;
          }
        } catch {
          // ignore keepalives
        }
      }
    }

    if (!text.trim()) {
      return completeChat(req);
    }
    return {
      ok: true,
      text,
      usage: {
        promptTokens,
        completionTokens,
        totalTokens: totalTokens || promptTokens + completionTokens,
      },
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Network error";
    if (message.toLowerCase().includes("abort")) {
      return {
        ok: false,
        error: "The model took too long to respond. Try a smaller section or retry.",
        code: "timeout",
        retryable: true,
      };
    }
    return {
      ok: false,
      error: sanitize(message, secrets) || "Could not reach the model.",
      code: "network",
      retryable: true,
    };
  } finally {
    clearTimeout(timer);
  }
}

export function xaiAvailable(): boolean {
  return Boolean(process.env.XAI_API_KEY);
}
