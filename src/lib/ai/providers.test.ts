import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { estimateCostUsd, friendlyAiError } from "./types.ts";
import { defaultAiConfig } from "../book/factory.ts";

describe("AI provider config", () => {
  it("defaults to Grok 4.5 on the official xAI endpoint", () => {
    const ai = defaultAiConfig();
    assert.equal(ai.kind, "xai");
    assert.equal(ai.model, "grok-4.5");
    assert.equal(ai.baseUrl, "https://api.x.ai/v1");
  });

  it("maps auth and rate-limit failures to readable errors", () => {
    const auth = friendlyAiError(401, "nope sk-secretkey");
    assert.equal(auth.code, "auth");
    assert.equal(auth.retryable, false);
    const rate = friendlyAiError(429, "slow down");
    assert.equal(rate.code, "rate");
    assert.equal(rate.retryable, true);
  });

  it("estimates cost from token counts", () => {
    const cost = estimateCostUsd(1_000_000, 1_000_000);
    assert.equal(cost, 18);
  });
});
