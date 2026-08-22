import { i as __toESM } from "../_runtime.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { n as TSS_SERVER_FUNCTION, r as getServerFnById, t as createServerFn } from "./ssr.mjs";
import { i as estimateCostUsd } from "./complete.server-DBIu05kc.mjs";
import { i as createChapter, n as cn, v as uid } from "./factory-WeNc_gGQ.mjs";
import { i as SliderTrack, n as SliderRange, r as SliderThumb, t as Slider$1 } from "../_libs/@radix-ui/react-slider+[...].mjs";
import { n as SwitchThumb, t as Switch$1 } from "../_libs/radix-ui__react-switch.mjs";
import { t as Root } from "../_libs/radix-ui__react-label.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/types-vTjikMWc.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Input = import_react.forwardRef(({ className, type, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
	type,
	className: cn("flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-none transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50", className),
	ref,
	...props
}));
Input.displayName = "Input";
var Textarea = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
	className: cn("flex min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50", className),
	ref,
	...props
}));
Textarea.displayName = "Textarea";
var Switch = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch$1, {
	ref,
	className: cn("peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors data-[state=checked]:bg-primary data-[state=unchecked]:bg-input", className),
	...props,
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SwitchThumb, { className: "pointer-events-none block size-5 rounded-full bg-background transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0" })
}));
Switch.displayName = Switch$1.displayName;
var Slider = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Slider$1, {
	ref,
	className: cn("relative flex w-full touch-none select-none items-center", className),
	...props,
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SliderTrack, {
		className: "relative h-1.5 w-full grow overflow-hidden rounded-full bg-secondary",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SliderRange, { className: "absolute h-full bg-primary" })
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SliderThumb, { className: "block size-4 rounded-full border border-primary bg-background" })]
}));
Slider.displayName = Slider$1.displayName;
var Label = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Root, {
	ref,
	className: cn("text-sm font-medium text-foreground leading-none", className),
	...props
}));
Label.displayName = Root.displayName;
function Field({ label, hint, className, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("flex flex-col gap-2", className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "flex items-baseline justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
				className: "text-muted-foreground",
				children: label
			}), hint ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-xs text-muted-foreground/80",
				children: hint
			}) : null]
		}), children]
	});
}
var INTRO_RE = /^(introduction|intro|preface|foreword|مقدمه|پیشگفتار|المقدمة)$/i;
var CONCLUSION_RE = /^(conclusion|epilogue|afterword|نتیجه|نتیجه‌گیری|خاتمه|الخاتمة)$/i;
var APPENDIX_RE = /^(appendix|پیوست|الملحق)/i;
var REFERENCES_RE = /^(references|bibliography|منابع|مراجع|المراجع)$/i;
function detectType(title) {
	const t = title.trim();
	if (INTRO_RE.test(t)) return "introduction";
	if (CONCLUSION_RE.test(t)) return "conclusion";
	if (APPENDIX_RE.test(t)) return "appendix";
	if (REFERENCES_RE.test(t)) return "references";
	return "chapter";
}
function stripChapterPrefix(title) {
	return title.replace(/^(chapter|chap\.?|بخش|فصل|الجزء|الفصل)\s*[\d۰-۹٠-٩ivxlcdmIVXLCDM]*[:.\-–—)]\s*/i, "").replace(/^[\d۰-۹٠-٩]+([.،:])\s*/, "").trim();
}
function headingLevel(line) {
	const md = line.match(/^(#{1,3})\s+(.+)$/);
	if (md) return {
		level: md[1].length,
		title: md[2].trim()
	};
	const dotted = line.match(/^(\d+(?:\.\d+){1,2})\s+(.+)$/);
	if (dotted) {
		const depth = dotted[1].split(".").length;
		return {
			level: Math.min(depth, 3),
			title: dotted[2].trim()
		};
	}
	const numbered = line.match(/^(\d+)[.)]\s+(.+)$/);
	if (numbered) return {
		level: 1,
		title: numbered[2].trim()
	};
	const persianNum = line.match(/^([۰-۹٠-٩]+(?:[.\.][۰-۹٠-٩]+){0,2})[.)]\s+(.+)$/);
	if (persianNum) return {
		level: persianNum[1].split(/[.\.]/).length,
		title: persianNum[2].trim()
	};
	const dash = line.match(/^(\s*)[-*•]\s+(.+)$/);
	if (dash) return {
		level: dash[1].replace(/\t/g, "  ").length >= 2 ? 2 : 1,
		title: dash[2].trim()
	};
	return null;
}
function makeSection(title, outline, order) {
	return {
		id: uid("sec"),
		title,
		outline,
		content: "",
		order,
		status: "empty",
		versions: []
	};
}
function parseOutline(raw, options = {
	includeIntroduction: true,
	includeConclusion: true
}) {
	const lines = raw.replace(/\r\n/g, "\n").split("\n");
	const chapters = [];
	let current = null;
	let buffer = [];
	function flushBuffer() {
		if (!current || buffer.length === 0) {
			buffer = [];
			return;
		}
		const text = buffer.join("\n").trim();
		buffer = [];
		if (!text) return;
		if (current.sections.length > 0) {
			const last = current.sections[current.sections.length - 1];
			last.outline = [last.outline, text].filter(Boolean).join("\n");
		} else current.outline = [current.outline, text].filter(Boolean).join("\n");
	}
	for (const rawLine of lines) {
		const line = rawLine.replace(/\s+$/, "");
		if (!line.trim()) {
			buffer.push("");
			continue;
		}
		const heading = headingLevel(line);
		if (heading && heading.level === 1) {
			flushBuffer();
			const title = stripChapterPrefix(heading.title) || heading.title;
			current = createChapter({
				title,
				type: detectType(title),
				order: chapters.length
			});
			chapters.push(current);
			continue;
		}
		if (heading && heading.level >= 2 && current) {
			flushBuffer();
			current.sections.push(makeSection(heading.title, "", current.sections.length));
			continue;
		}
		if (!current) {
			current = createChapter({
				title: stripChapterPrefix(line) || line.trim(),
				type: detectType(line),
				order: 0
			});
			chapters.push(current);
			continue;
		}
		buffer.push(line.trim());
	}
	flushBuffer();
	if (chapters.length === 0) raw.split("\n").map((l) => l.trim()).filter(Boolean).forEach((title, i) => {
		chapters.push(createChapter({
			title: stripChapterPrefix(title) || title,
			type: detectType(title),
			order: i
		}));
	});
	let result = chapters.map((ch, i) => ({
		...ch,
		order: i
	}));
	const hasIntro = result.some((c) => c.type === "introduction");
	const hasConclusion = result.some((c) => c.type === "conclusion");
	if (options.includeIntroduction && !hasIntro) result = [createChapter({
		title: "Introduction",
		type: "introduction",
		objective: "Open the book, state the promise, and orient the reader.",
		order: 0
	}), ...result];
	if (options.includeConclusion && !hasConclusion) result = [...result, createChapter({
		title: "Conclusion",
		type: "conclusion",
		objective: "Synthesize the argument and leave the reader with a clear close.",
		order: result.length
	})];
	return result.map((ch, i) => ({
		...ch,
		order: i
	}));
}
function flattenNodes(chapters) {
	const nodes = [];
	for (const chapter of chapters) if (chapter.sections.length === 0) nodes.push({
		chapter,
		nodeId: chapter.id
	});
	else for (const section of chapter.sections) nodes.push({
		chapter,
		section,
		nodeId: section.id
	});
	return nodes;
}
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var getAiStatus = createServerFn({ method: "GET" }).handler(createSsrRpc("e7fd996a546c9dfe2eaf8857329251ff910df226ca7663e7652f24a0baf69443"));
var completeOnce = createServerFn({ method: "POST" }).validator((input) => input).handler(createSsrRpc("d4a5fb700a0f60b7f2e8d605315bcd4ad71b62e59ffebad3024f6932cade8445"));
function addUsage(current, usage) {
	const input = current.inputTokens + usage.promptTokens;
	const output = current.outputTokens + usage.completionTokens;
	return {
		inputTokens: input,
		outputTokens: output,
		totalTokens: current.totalTokens + (usage.totalTokens || usage.promptTokens + usage.completionTokens),
		estimatedCostUsd: estimateCostUsd(input, output),
		calls: current.calls + 1
	};
}
async function streamComplete(req, onDelta) {
	const res = await fetch("/api/ai/complete", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			...req,
			stream: true
		})
	});
	if (!res.ok) {
		let error = "The writing engine could not start.";
		try {
			const body = await res.json();
			if (body.error) error = body.error;
		} catch {
			error = `The writing engine returned HTTP ${res.status}.`;
		}
		return {
			ok: false,
			error,
			retryable: res.status >= 500,
			code: "unavailable"
		};
	}
	if (!res.body) return completeOnce({ data: req });
	const reader = res.body.getReader();
	const decoder = new TextDecoder();
	let buffer = "";
	let text = "";
	let promptTokens = 0;
	let completionTokens = 0;
	let totalTokens = 0;
	let error = null;
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
				const json = JSON.parse(data);
				if (json.error) error = {
					ok: false,
					error: json.error,
					retryable: Boolean(json.retryable),
					code: "invalid"
				};
				if (json.delta) {
					text += json.delta;
					onDelta(json.delta);
				}
				if (json.usage) {
					promptTokens = json.usage.promptTokens;
					completionTokens = json.usage.completionTokens;
					totalTokens = json.usage.totalTokens;
				}
			} catch {}
		}
	}
	if (error) return error;
	if (!text.trim()) return completeOnce({ data: req });
	return {
		ok: true,
		text,
		usage: {
			promptTokens,
			completionTokens,
			totalTokens
		}
	};
}
var WRITING_STYLES = [
	{
		id: "academic",
		label: "Academic",
		hint: "Cited, precise, formal argumentation"
	},
	{
		id: "educational",
		label: "Educational",
		hint: "Clear teaching with examples"
	},
	{
		id: "professional",
		label: "Professional",
		hint: "Business-ready and concise"
	},
	{
		id: "technical",
		label: "Technical",
		hint: "Exact, structured, specialist"
	},
	{
		id: "beginner",
		label: "Beginner-friendly",
		hint: "Simple language, no jargon"
	},
	{
		id: "formal",
		label: "Formal",
		hint: "Elevated, ceremonial prose"
	},
	{
		id: "conversational",
		label: "Conversational",
		hint: "Warm, spoken, direct"
	},
	{
		id: "storytelling",
		label: "Storytelling",
		hint: "Narrative scenes and tension"
	},
	{
		id: "documentary",
		label: "Documentary",
		hint: "Observed, factual, cinematic"
	},
	{
		id: "custom",
		label: "Custom",
		hint: "Your own voice instructions"
	}
];
var LANGUAGES = [
	{
		id: "en",
		label: "English",
		native: "English"
	},
	{
		id: "fa",
		label: "Persian",
		native: "فارسی"
	},
	{
		id: "ar",
		label: "Arabic",
		native: "العربية"
	},
	{
		id: "de",
		label: "German",
		native: "Deutsch"
	},
	{
		id: "fr",
		label: "French",
		native: "Français"
	},
	{
		id: "es",
		label: "Spanish",
		native: "Español"
	},
	{
		id: "other",
		label: "Other",
		native: "Other"
	}
];
var FONT_CHOICES = [
	"Georgia",
	"Times New Roman",
	"Garamond",
	"Palatino",
	"Calibri",
	"Cambria",
	"Arial",
	"Tahoma",
	"Vazirmatn",
	"B Nazanin",
	"B Lotus",
	"Tahoma",
	"Segoe UI",
	"Courier New"
];
//#endregion
export { Slider as a, WRITING_STYLES as c, getAiStatus as d, parseOutline as f, LANGUAGES as i, addUsage as l, Field as n, Switch as o, streamComplete as p, Input as r, Textarea as s, FONT_CHOICES as t, flattenNodes as u };
