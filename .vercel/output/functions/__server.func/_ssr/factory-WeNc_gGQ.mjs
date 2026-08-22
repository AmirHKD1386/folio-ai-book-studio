import { i as __toESM } from "../_runtime.mjs";
import { o as require_jsx_runtime, r as Slot, s as require_react } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/factory-WeNc_gGQ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
function uid(prefix = "id") {
	return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
}
function formatDate(ts, locale = "en") {
	try {
		return new Intl.DateTimeFormat(locale, {
			month: "short",
			day: "numeric",
			year: "numeric"
		}).format(ts);
	} catch {
		return new Date(ts).toLocaleDateString();
	}
}
function wordCount(text) {
	const trimmed = text.trim();
	if (!trimmed) return 0;
	return trimmed.split(/\s+/).length;
}
function downloadBlob(blob, filename) {
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = filename;
	a.rel = "noopener";
	document.body.appendChild(a);
	a.click();
	a.remove();
	setTimeout(() => URL.revokeObjectURL(url), 1500);
}
function isRtlLanguage(lang) {
	return lang === "fa" || lang === "ar" || lang === "he" || lang === "ur";
}
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-[color,background-color,box-shadow,transform,opacity] duration-150 ease-out disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:not-disabled:scale-[0.96]", {
	variants: {
		variant: {
			default: "bg-primary text-primary-foreground hover:bg-primary/90",
			secondary: "bg-secondary text-secondary-foreground hover:bg-accent",
			ghost: "hover:bg-accent hover:text-accent-foreground",
			outline: "border border-border bg-transparent hover:bg-accent",
			destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
			paper: "bg-paper text-ink hover:bg-paper/90"
		},
		size: {
			default: "h-10 px-4",
			sm: "h-8 rounded-md px-3 text-xs",
			lg: "h-11 rounded-lg px-5",
			icon: "size-10",
			"icon-sm": "size-8"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
var Button = import_react.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size,
			className
		})),
		ref,
		...props
	});
});
Button.displayName = "Button";
var DB_NAME = "folio-studio";
var DB_VERSION = 1;
function openDb() {
	return new Promise((resolve, reject) => {
		const req = indexedDB.open(DB_NAME, DB_VERSION);
		req.onupgradeneeded = () => {
			const db = req.result;
			if (!db.objectStoreNames.contains("books")) db.createObjectStore("books", { keyPath: "id" });
			if (!db.objectStoreNames.contains("secrets")) db.createObjectStore("secrets", { keyPath: "id" });
		};
		req.onsuccess = () => resolve(req.result);
		req.onerror = () => reject(req.error ?? /* @__PURE__ */ new Error("IndexedDB open failed"));
	});
}
function txDone(tx) {
	return new Promise((resolve, reject) => {
		tx.oncomplete = () => resolve();
		tx.onerror = () => reject(tx.error ?? /* @__PURE__ */ new Error("IndexedDB transaction failed"));
		tx.onabort = () => reject(tx.error ?? /* @__PURE__ */ new Error("IndexedDB transaction aborted"));
	});
}
function toListItem(book) {
	const words = book.chapters.reduce((sum, ch) => {
		const sectionWords = ch.sections.reduce((s, sec) => s + wordCount(sec.content), 0);
		return sum + wordCount(ch.content) + sectionWords;
	}, 0);
	return {
		id: book.id,
		title: book.title,
		subtitle: book.subtitle,
		author: book.author,
		language: book.language,
		chapterCount: book.chapters.length,
		wordCount: words,
		updatedAt: book.updatedAt,
		createdAt: book.createdAt,
		generationStatus: book.generation.status
	};
}
async function listBooks() {
	const db = await openDb();
	return new Promise((resolve, reject) => {
		const req = db.transaction("books", "readonly").objectStore("books").getAll();
		req.onsuccess = () => {
			const books = req.result.map(toListItem);
			books.sort((a, b) => b.updatedAt - a.updatedAt);
			resolve(books);
		};
		req.onerror = () => reject(req.error);
	});
}
async function getBook(id) {
	const db = await openDb();
	return new Promise((resolve, reject) => {
		const req = db.transaction("books", "readonly").objectStore("books").get(id);
		req.onsuccess = () => resolve(req.result ?? null);
		req.onerror = () => reject(req.error);
	});
}
async function saveBook(book) {
	const next = {
		...book,
		updatedAt: Date.now()
	};
	const tx = (await openDb()).transaction("books", "readwrite");
	tx.objectStore("books").put(next);
	await txDone(tx);
}
async function deleteBook(id) {
	const tx = (await openDb()).transaction("books", "readwrite");
	tx.objectStore("books").delete(id);
	await txDone(tx);
}
async function saveApiKey(providerId, apiKey) {
	const keys = await loadApiKeys();
	if (apiKey) keys[providerId] = apiKey;
	else delete keys[providerId];
	const tx = (await openDb()).transaction("secrets", "readwrite");
	tx.objectStore("secrets").put({
		id: "api-keys",
		keys
	});
	await txDone(tx);
}
async function loadApiKeys() {
	const db = await openDb();
	return new Promise((resolve, reject) => {
		const req = db.transaction("secrets", "readonly").objectStore("secrets").get("api-keys");
		req.onsuccess = () => {
			const row = req.result;
			resolve(row?.keys ?? {});
		};
		req.onerror = () => reject(req.error);
	});
}
async function getApiKey(providerId) {
	return (await loadApiKeys())[providerId] ?? "";
}
function exportProjectJson(book) {
	return JSON.stringify(book, null, 2);
}
function parseImportedProject(raw) {
	const data = JSON.parse(raw);
	if (!data || typeof data !== "object" || typeof data.id !== "string") throw new Error("This file is not a Folio project.");
	if (!Array.isArray(data.chapters)) throw new Error("The project is missing chapters and cannot be opened.");
	return data;
}
function defaultFormatting(language) {
	const rtl = language === "fa" || language === "ar";
	return {
		bodyFont: rtl ? "Tahoma" : "Georgia",
		heading1Font: rtl ? "Tahoma" : "Georgia",
		heading2Font: rtl ? "Tahoma" : "Georgia",
		heading3Font: rtl ? "Tahoma" : "Georgia",
		bodySize: 12,
		heading1Size: 18,
		heading2Size: 14,
		heading3Size: 12,
		lineSpacing: 1.5,
		paragraphSpacing: 8,
		firstLineIndent: rtl ? 0 : .3,
		alignment: "justify",
		headingSpacingBefore: 18,
		headingSpacingAfter: 8,
		pageSize: "a4",
		marginTop: 1,
		marginBottom: 1,
		marginLeft: 1.15,
		marginRight: 1.15,
		headerText: "",
		footerText: "",
		pageNumbers: true,
		chapterPageBreaks: true,
		coverPage: true,
		tableOfContents: true,
		persianNumbers: language === "fa"
	};
}
function defaultAiConfig() {
	return {
		id: "xai",
		kind: "xai",
		name: "Grok (xAI)",
		baseUrl: "https://api.x.ai/v1",
		model: "grok-4.5",
		temperature: .7,
		maxOutputTokens: 2500,
		systemPrompt: "",
		customHeaders: {}
	};
}
function emptyContext() {
	return {
		chapterSummaries: [],
		concepts: [],
		glossary: [],
		keyFacts: [],
		characters: [],
		rules: [],
		decisions: [],
		styleNotes: [],
		references: [],
		userInstructions: []
	};
}
function emptyUsage() {
	return {
		inputTokens: 0,
		outputTokens: 0,
		totalTokens: 0,
		estimatedCostUsd: 0,
		calls: 0
	};
}
function idleGeneration() {
	return {
		status: "idle",
		completedNodeIds: [],
		totalNodes: 0,
		message: ""
	};
}
function createChapter(partial) {
	return {
		id: partial.id ?? uid("ch"),
		type: partial.type,
		title: partial.title,
		objective: partial.objective ?? "",
		outline: partial.outline ?? "",
		order: partial.order ?? 0,
		sections: partial.sections ?? [],
		content: partial.content ?? "",
		summary: partial.summary ?? "",
		status: partial.status ?? "empty",
		versions: partial.versions ?? []
	};
}
function createBook(partial = {}) {
	const now = Date.now();
	const language = partial.language ?? "en";
	return {
		id: partial.id ?? uid("book"),
		title: partial.title ?? "Untitled manuscript",
		subtitle: partial.subtitle ?? "",
		author: partial.author ?? "",
		description: partial.description ?? "",
		language,
		customLanguage: partial.customLanguage,
		writingStyle: partial.writingStyle ?? "educational",
		customStyleInstructions: partial.customStyleInstructions ?? "",
		targetAudience: partial.targetAudience ?? "General readers",
		outlineRaw: partial.outlineRaw ?? "",
		includeIntroduction: partial.includeIntroduction ?? true,
		includeConclusion: partial.includeConclusion ?? true,
		includeReferences: partial.includeReferences ?? false,
		includeAppendix: partial.includeAppendix ?? false,
		formatting: partial.formatting ?? defaultFormatting(language),
		ai: partial.ai ?? defaultAiConfig(),
		promptOverrides: partial.promptOverrides ?? {},
		chapters: partial.chapters ?? [],
		references: partial.references ?? [],
		context: partial.context ?? emptyContext(),
		usage: partial.usage ?? emptyUsage(),
		qualityReport: partial.qualityReport,
		generation: partial.generation ?? idleGeneration(),
		createdAt: partial.createdAt ?? now,
		updatedAt: partial.updatedAt ?? now
	};
}
//#endregion
export { saveBook as _, defaultAiConfig as a, downloadBlob as c, getApiKey as d, getBook as f, saveApiKey as g, parseImportedProject as h, createChapter as i, exportProjectJson as l, listBooks as m, cn as n, defaultFormatting as o, isRtlLanguage as p, createBook as r, deleteBook as s, Button as t, formatDate as u, uid as v, wordCount as y };
