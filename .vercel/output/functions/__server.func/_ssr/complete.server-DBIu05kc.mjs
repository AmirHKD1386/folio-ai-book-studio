//#region node_modules/.nitro/vite/services/ssr/assets/complete.server-DBIu05kc.js
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
var COST_PER_MILLION = {
	input: 3,
	output: 15
};
function estimateCostUsd(inputTokens, outputTokens) {
	return inputTokens / 1e6 * COST_PER_MILLION.input + outputTokens / 1e6 * COST_PER_MILLION.output;
}
function friendlyAiError(status, body) {
	if (status === 401 || status === 403) return {
		ok: false,
		error: "The API key was rejected. Check the key and try again.",
		code: "auth",
		retryable: false
	};
	if (status === 429) return {
		ok: false,
		error: "The model is rate-limited right now. Wait a moment and retry.",
		code: "rate",
		retryable: true
	};
	if (status === 404) return {
		ok: false,
		error: "That model is not available on this endpoint.",
		code: "model",
		retryable: false
	};
	if (status >= 500) return {
		ok: false,
		error: "The model provider had a server error. Retry in a moment.",
		code: "unavailable",
		retryable: true
	};
	return {
		ok: false,
		error: body.replace(/sk-[a-zA-Z0-9]+/g, "[redacted]").slice(0, 180) || `The provider returned HTTP ${status}.`,
		code: "invalid",
		retryable: status >= 500
	};
}
var complete_server_exports = /* @__PURE__ */ __exportAll({
	completeChat: () => completeChat,
	streamChat: () => streamChat
});
var DEFAULT_XAI = "https://api.x.ai/v1";
function sanitize(text, secrets) {
	let out = text;
	for (const s of secrets) if (s && s.length > 4) out = out.split(s).join("[redacted]");
	return out;
}
function resolveEndpoint(req) {
	const secrets = [];
	if (req.provider === "xai") {
		const apiKey = process.env.XAI_API_KEY ?? "";
		if (!apiKey) return {
			url: "",
			apiKey: "",
			headers: {},
			error: {
				ok: false,
				error: "Grok is not available in this environment. Add your own API in Engine settings.",
				code: "unavailable",
				retryable: false
			}
		};
		secrets.push(apiKey);
		return {
			url: `${DEFAULT_XAI}/chat/completions`,
			apiKey,
			headers: { Authorization: `Bearer ${apiKey}` }
		};
	}
	const apiKey = req.apiKey ?? "";
	if (apiKey) secrets.push(apiKey);
	const base = (req.baseUrl || "").replace(/\/+$/, "");
	if (!base) return {
		url: "",
		apiKey: "",
		headers: {},
		error: {
			ok: false,
			error: "A base URL is required for this provider.",
			code: "invalid",
			retryable: false
		}
	};
	const headers = { ...req.headers ?? {} };
	if (apiKey && !headers.Authorization && !headers.authorization) headers.Authorization = `Bearer ${apiKey}`;
	return {
		url: base.endsWith("/chat/completions") ? base : `${base}/chat/completions`,
		apiKey,
		headers
	};
}
async function completeChat(req) {
	const resolved = resolveEndpoint(req);
	if (resolved.error) return resolved.error;
	const secrets = [resolved.apiKey, req.apiKey ?? ""];
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), 12e4);
	try {
		const res = await fetch(resolved.url, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				...resolved.headers
			},
			body: JSON.stringify({
				model: req.model || "grok-4.5",
				temperature: req.temperature,
				max_tokens: req.maxTokens,
				messages: req.messages,
				stream: false
			}),
			signal: controller.signal
		});
		const raw = await res.text();
		if (!res.ok) return friendlyAiError(res.status, sanitize(raw, secrets));
		let body;
		try {
			body = JSON.parse(raw);
		} catch {
			return {
				ok: false,
				error: "The model returned a response that was not valid JSON.",
				code: "invalid",
				retryable: true
			};
		}
		const text = body.choices?.[0]?.message?.content ?? "";
		if (!text.trim()) return {
			ok: false,
			error: "The model returned an empty response. Try again with a shorter prompt.",
			code: "invalid",
			retryable: true
		};
		const promptTokens = body.usage?.prompt_tokens ?? 0;
		const completionTokens = body.usage?.completion_tokens ?? 0;
		return {
			ok: true,
			text,
			usage: {
				promptTokens,
				completionTokens,
				totalTokens: body.usage?.total_tokens ?? promptTokens + completionTokens
			}
		};
	} catch (err) {
		const message = err instanceof Error ? err.message : "Network error";
		if (message.toLowerCase().includes("abort")) return {
			ok: false,
			error: "The model took too long to respond. Try a smaller section or retry.",
			code: "timeout",
			retryable: true
		};
		return {
			ok: false,
			error: sanitize(message, secrets) || "Could not reach the model.",
			code: "network",
			retryable: true
		};
	} finally {
		clearTimeout(timer);
	}
}
async function streamChat(req, onDelta) {
	const resolved = resolveEndpoint(req);
	if (resolved.error) return resolved.error;
	const secrets = [resolved.apiKey, req.apiKey ?? ""];
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), 18e4);
	try {
		const res = await fetch(resolved.url, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				...resolved.headers
			},
			body: JSON.stringify({
				model: req.model || "grok-4.5",
				temperature: req.temperature,
				max_tokens: req.maxTokens,
				messages: req.messages,
				stream: true,
				stream_options: { include_usage: true }
			}),
			signal: controller.signal
		});
		if (!res.ok) {
			const raw = await res.text();
			return friendlyAiError(res.status, sanitize(raw, secrets));
		}
		if (!res.body) return completeChat({ ...req });
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
					const json = JSON.parse(data);
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
				} catch {}
			}
		}
		if (!text.trim()) return completeChat(req);
		return {
			ok: true,
			text,
			usage: {
				promptTokens,
				completionTokens,
				totalTokens: totalTokens || promptTokens + completionTokens
			}
		};
	} catch (err) {
		const message = err instanceof Error ? err.message : "Network error";
		if (message.toLowerCase().includes("abort")) return {
			ok: false,
			error: "The model took too long to respond. Try a smaller section or retry.",
			code: "timeout",
			retryable: true
		};
		return {
			ok: false,
			error: sanitize(message, secrets) || "Could not reach the model.",
			code: "network",
			retryable: true
		};
	} finally {
		clearTimeout(timer);
	}
}
//#endregion
export { __exportAll as a, estimateCostUsd as i, complete_server_exports as n, streamChat as r, completeChat as t };
