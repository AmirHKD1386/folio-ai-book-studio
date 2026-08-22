import { createServerFn } from "@tanstack/react-start";
import type { CompleteRequest, CompleteResponse } from "./types";
import { estimateCostUsd } from "./types";
import type { TokenUsage } from "@/lib/book/types";

export const getAiStatus = createServerFn({ method: "GET" }).handler(async () => {
  return { xaiAvailable: Boolean(process.env.XAI_API_KEY) };
});

export const completeOnce = createServerFn({ method: "POST" })
  .validator((input: CompleteRequest) => input)
  .handler(async ({ data }): Promise<CompleteResponse> => {
    const { completeChat } = await import("./complete.server");
    return completeChat(data);
  });

export function addUsage(
  current: TokenUsage,
  usage: { promptTokens: number; completionTokens: number; totalTokens: number },
): TokenUsage {
  const input = current.inputTokens + usage.promptTokens;
  const output = current.outputTokens + usage.completionTokens;
  return {
    inputTokens: input,
    outputTokens: output,
    totalTokens: current.totalTokens + (usage.totalTokens || usage.promptTokens + usage.completionTokens),
    estimatedCostUsd: estimateCostUsd(input, output),
    calls: current.calls + 1,
  };
}

export async function streamComplete(
  req: CompleteRequest,
  onDelta: (chunk: string) => void,
): Promise<CompleteResponse> {
  const res = await fetch("/api/ai/complete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...req, stream: true }),
  });
  if (!res.ok) {
    let error = "The writing engine could not start.";
    try {
      const body = (await res.json()) as { error?: string };
      if (body.error) error = body.error;
    } catch {
      error = `The writing engine returned HTTP ${res.status}.`;
    }
    return { ok: false, error, retryable: res.status >= 500, code: "unavailable" };
  }
  if (!res.body) {
    return completeOnce({ data: req });
  }
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let text = "";
  let promptTokens = 0;
  let completionTokens = 0;
  let totalTokens = 0;
  let error: CompleteResponse | null = null;

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
      if (!data || data === "[DONE]") continue;
      try {
        const json = JSON.parse(data) as {
          delta?: string;
          usage?: { promptTokens: number; completionTokens: number; totalTokens: number };
          error?: string;
          retryable?: boolean;
        };
        if (json.error) {
          error = {
            ok: false,
            error: json.error,
            retryable: Boolean(json.retryable),
            code: "invalid",
          };
        }
        if (json.delta) {
          text += json.delta;
          onDelta(json.delta);
        }
        if (json.usage) {
          promptTokens = json.usage.promptTokens;
          completionTokens = json.usage.completionTokens;
          totalTokens = json.usage.totalTokens;
        }
      } catch {
        // ignore
      }
    }
  }

  if (error) return error;
  if (!text.trim()) {
    return completeOnce({ data: req });
  }
  return {
    ok: true,
    text,
    usage: { promptTokens, completionTokens, totalTokens },
  };
}
