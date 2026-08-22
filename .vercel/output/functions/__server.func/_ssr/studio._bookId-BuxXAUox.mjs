import { i as __toESM } from "../_runtime.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { _ as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as DialogOverlay$1, i as DialogDescription$1, n as DialogClose, o as DialogPortal$1, r as DialogContent$1, s as DialogTitle$1, t as Dialog$1 } from "../_libs/@radix-ui/react-dialog+[...].mjs";
import { _ as saveBook, c as downloadBlob, d as getApiKey, f as getBook, g as saveApiKey, i as createChapter, l as exportProjectJson, n as cn, p as isRtlLanguage, t as Button, v as uid, y as wordCount } from "./factory-WeNc_gGQ.mjs";
import { a as Slider, c as WRITING_STYLES, i as LANGUAGES, l as addUsage, n as Field, o as Switch, p as streamComplete, r as Input, s as Textarea, t as FONT_CHOICES, u as flattenNodes } from "./types-vTjikMWc.mjs";
import { C as Eye, D as ChevronRight, E as CornerDownRight, M as ArrowLeft, O as ChevronDown, T as Download, _ as LoaderCircle, a as Terminal, b as GripVertical, c as Settings2, d as Plus, f as Play, g as Minimize2, h as PanelLeft, i as Trash2, l as RotateCcw, m as Pause, n as WandSparkles, o as Sparkles, p as PenLine, s as ShieldCheck, t as X, u as RefreshCw, v as Languages, w as Expand, x as FileText, y as History } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as Route$1 } from "./router-CZN6zBQO.mjs";
import { n as nn, r as qt, t as Qt } from "../_libs/react-resizable-panels.mjs";
import { i as Viewport, n as Scrollbar, r as Thumb, t as Root } from "../_libs/radix-ui__react-scroll-area.mjs";
import { t as create } from "../_libs/zustand.mjs";
import { n as Root$1, t as Indicator } from "../_libs/radix-ui__react-progress.mjs";
import { i as Trigger, n as List, r as Root2, t as Content } from "../_libs/radix-ui__react-tabs.mjs";
import { a as HeadingLevel, c as PageNumber, d as TextRun, f as convertInchesToTwip, i as Header, l as Paragraph, n as File, o as LevelFormat, r as Footer, s as Packer, t as AlignmentType, u as TableOfContents } from "../_libs/docx.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/studio._bookId-BuxXAUox.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var ScrollArea = import_react.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Root, {
	ref,
	className: cn("relative overflow-hidden", className),
	...props,
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Viewport, {
		className: "h-full w-full rounded-[inherit]",
		children
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scrollbar, {
		orientation: "vertical",
		className: "flex touch-none select-none p-0.5 transition-colors w-2.5",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Thumb, { className: "relative flex-1 rounded-full bg-border" })
	})]
}));
ScrollArea.displayName = Root.displayName;
function pushVersion(versions, content, source, label) {
	if (!content.trim()) return versions;
	const last = versions[versions.length - 1];
	if (last && last.content === content) return versions;
	const snap = {
		id: uid("ver"),
		createdAt: Date.now(),
		label: label ?? (source === "generate" ? "Generated" : source === "ai-action" ? "AI edit" : "Edit"),
		content,
		source
	};
	return [...versions, snap].slice(-20);
}
function restoreVersion(node, versionId) {
	const found = node.versions.find((v) => v.id === versionId);
	if (!found) return null;
	return {
		content: found.content,
		versions: pushVersion(node.versions, node.content, "restore", "Before restore"),
		status: "edited"
	};
}
var saveTimer = null;
var useStudio = create((set, get) => ({
	book: null,
	selection: null,
	loading: false,
	saving: false,
	error: null,
	lastSavedAt: null,
	load: async (id) => {
		set({
			loading: true,
			error: null
		});
		try {
			const book = await getBook(id);
			if (!book) {
				set({
					book: null,
					loading: false,
					error: "This manuscript could not be found."
				});
				return;
			}
			const first = book.chapters[0];
			set({
				book,
				loading: false,
				selection: first ? {
					chapterId: first.id,
					sectionId: first.sections[0]?.id
				} : null
			});
		} catch (e) {
			set({
				loading: false,
				error: e instanceof Error ? e.message : "Could not open the manuscript."
			});
		}
	},
	persist: async () => {
		const book = get().book;
		if (!book) return;
		set({ saving: true });
		try {
			await saveBook(book);
			set({
				saving: false,
				lastSavedAt: Date.now()
			});
		} catch (e) {
			set({
				saving: false,
				error: e instanceof Error ? e.message : "Autosave failed."
			});
		}
	},
	patch: (updater, persist = true) => {
		const current = get().book;
		if (!current) return;
		set({ book: updater(current) });
		if (!persist) return;
		if (saveTimer) clearTimeout(saveTimer);
		saveTimer = setTimeout(() => {
			get().persist();
		}, 700);
	},
	select: (sel) => set({ selection: sel }),
	selectedNode: () => {
		const { book, selection } = get();
		if (!book || !selection) return null;
		const chapter = book.chapters.find((c) => c.id === selection.chapterId);
		if (!chapter) return null;
		return {
			chapter,
			section: selection.sectionId ? chapter.sections.find((s) => s.id === selection.sectionId) : void 0
		};
	},
	setContent: (content, source = "edit") => {
		const { selection } = get();
		if (!selection) return;
		get().patch((book) => ({
			...book,
			chapters: book.chapters.map((ch) => {
				if (ch.id !== selection.chapterId) return ch;
				if (selection.sectionId) return {
					...ch,
					sections: ch.sections.map((s) => s.id === selection.sectionId ? {
						...s,
						content,
						status: source === "edit" ? "edited" : "generated",
						versions: source === "edit" ? s.versions : pushVersion(s.versions, s.content, source)
					} : s)
				};
				return {
					...ch,
					content,
					status: source === "edit" ? "edited" : "generated",
					versions: source === "edit" ? ch.versions : pushVersion(ch.versions, ch.content, source)
				};
			})
		}));
	},
	addChapter: () => {
		get().patch((book) => {
			const ch = createChapter({
				title: `Chapter ${book.chapters.length + 1}`,
				type: "chapter",
				order: book.chapters.length
			});
			return {
				...book,
				chapters: [...book.chapters, ch]
			};
		});
	},
	addSection: (chapterId) => {
		const id = uid("sec");
		get().patch((book) => ({
			...book,
			chapters: book.chapters.map((ch) => ch.id === chapterId ? {
				...ch,
				sections: [...ch.sections, {
					id,
					title: `Section ${ch.sections.length + 1}`,
					outline: "",
					content: "",
					order: ch.sections.length,
					status: "empty",
					versions: []
				}]
			} : ch)
		}));
		get().select({
			chapterId,
			sectionId: id
		});
	},
	deleteChapter: (chapterId) => {
		get().patch((book) => {
			const chapters = book.chapters.filter((c) => c.id !== chapterId).map((c, i) => ({
				...c,
				order: i
			}));
			return {
				...book,
				chapters
			};
		});
		const book = get().book;
		if (book?.chapters[0]) get().select({
			chapterId: book.chapters[0].id,
			sectionId: book.chapters[0].sections[0]?.id
		});
	},
	deleteSection: (chapterId, sectionId) => {
		get().patch((book) => ({
			...book,
			chapters: book.chapters.map((ch) => ch.id === chapterId ? {
				...ch,
				sections: ch.sections.filter((s) => s.id !== sectionId).map((s, i) => ({
					...s,
					order: i
				}))
			} : ch)
		}));
	},
	renameChapter: (chapterId, title) => {
		get().patch((book) => ({
			...book,
			chapters: book.chapters.map((ch) => ch.id === chapterId ? {
				...ch,
				title
			} : ch)
		}));
	},
	renameSection: (chapterId, sectionId, title) => {
		get().patch((book) => ({
			...book,
			chapters: book.chapters.map((ch) => ch.id === chapterId ? {
				...ch,
				sections: ch.sections.map((s) => s.id === sectionId ? {
					...s,
					title
				} : s)
			} : ch)
		}));
	},
	moveChapter: (chapterId, dir) => {
		get().patch((book) => {
			const idx = book.chapters.findIndex((c) => c.id === chapterId);
			const next = idx + dir;
			if (idx < 0 || next < 0 || next >= book.chapters.length) return book;
			const chapters = [...book.chapters];
			const [item] = chapters.splice(idx, 1);
			chapters.splice(next, 0, item);
			return {
				...book,
				chapters: chapters.map((c, i) => ({
					...c,
					order: i
				}))
			};
		});
	},
	moveSection: (chapterId, sectionId, dir) => {
		get().patch((book) => ({
			...book,
			chapters: book.chapters.map((ch) => {
				if (ch.id !== chapterId) return ch;
				const idx = ch.sections.findIndex((s) => s.id === sectionId);
				const next = idx + dir;
				if (idx < 0 || next < 0 || next >= ch.sections.length) return ch;
				const sections = [...ch.sections];
				const [item] = sections.splice(idx, 1);
				sections.splice(next, 0, item);
				return {
					...ch,
					sections: sections.map((s, i) => ({
						...s,
						order: i
					}))
				};
			})
		}));
	}
}));
function useSelectedNode() {
	const book = useStudio((s) => s.book);
	const selection = useStudio((s) => s.selection);
	return (0, import_react.useMemo)(() => {
		if (!book || !selection) return null;
		const chapter = book.chapters.find((c) => c.id === selection.chapterId);
		if (!chapter) return null;
		return {
			chapter,
			section: selection.sectionId ? chapter.sections.find((s) => s.id === selection.sectionId) : void 0
		};
	}, [book, selection]);
}
function StructurePanel() {
	const book = useStudio((s) => s.book);
	const selection = useStudio((s) => s.selection);
	const select = useStudio((s) => s.select);
	const addChapter = useStudio((s) => s.addChapter);
	const addSection = useStudio((s) => s.addSection);
	const deleteChapter = useStudio((s) => s.deleteChapter);
	const deleteSection = useStudio((s) => s.deleteSection);
	const renameChapter = useStudio((s) => s.renameChapter);
	const renameSection = useStudio((s) => s.renameSection);
	const moveChapter = useStudio((s) => s.moveChapter);
	const moveSection = useStudio((s) => s.moveSection);
	const [open, setOpen] = (0, import_react.useState)({});
	if (!book) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full flex-col bg-card",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between gap-2 border-b border-border px-3 py-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs uppercase tracking-[0.16em] text-muted-foreground",
				children: "Structure"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				size: "icon-sm",
				variant: "ghost",
				onClick: addChapter,
				"aria-label": "Add chapter",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" })
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollArea, {
			className: "flex-1",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "p-2",
				children: book.chapters.map((ch, idx) => {
					const expanded = open[ch.id] ?? true;
					const selected = selection?.chapterId === ch.id && !selection.sectionId;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "mb-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: cn("group flex items-center gap-1 rounded-md px-1 py-1", selected && "bg-secondary"),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "size-7 shrink-0 text-muted-foreground",
									onClick: () => setOpen((o) => ({
										...o,
										[ch.id]: !expanded
									})),
									"aria-label": expanded ? "Collapse" : "Expand",
									children: ch.sections.length ? expanded ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GripVertical, { className: "size-3.5 opacity-40" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "min-w-0 flex-1 truncate text-left text-sm",
									onClick: () => select({ chapterId: ch.id }),
									onDoubleClick: () => {
										const next = window.prompt("Chapter title", ch.title);
										if (next?.trim()) renameChapter(ch.id, next.trim());
									},
									children: ch.title
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusDot, { chapter: ch }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "hidden group-hover:flex",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconBtn, {
											label: "Move up",
											onClick: () => moveChapter(ch.id, -1),
											disabled: idx === 0,
											children: "↑"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconBtn, {
											label: "Move down",
											onClick: () => moveChapter(ch.id, 1),
											disabled: idx === book.chapters.length - 1,
											children: "↓"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											className: "size-7 text-muted-foreground hover:text-destructive",
											"aria-label": "Delete chapter",
											onClick: () => deleteChapter(ch.id),
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-3.5" })
										})
									]
								})
							]
						}), expanded ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
							className: "ml-6",
							children: [ch.sections.map((sec, sidx) => {
								const secSel = selection?.chapterId === ch.id && selection.sectionId === sec.id;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: cn("group flex items-center gap-1 rounded-md px-1 py-0.5", secSel && "bg-secondary"),
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											className: "min-w-0 flex-1 truncate py-1 text-left text-sm text-muted-foreground",
											onClick: () => select({
												chapterId: ch.id,
												sectionId: sec.id
											}),
											onDoubleClick: () => {
												const next = window.prompt("Section title", sec.title);
												if (next?.trim()) renameSection(ch.id, sec.id, next.trim());
											},
											children: sec.title
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-[10px] tabular-nums text-muted-foreground",
											children: wordCount(sec.content) || ""
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "hidden group-hover:flex",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconBtn, {
													label: "Up",
													onClick: () => moveSection(ch.id, sec.id, -1),
													disabled: sidx === 0,
													children: "↑"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconBtn, {
													label: "Down",
													onClick: () => moveSection(ch.id, sec.id, 1),
													disabled: sidx === ch.sections.length - 1,
													children: "↓"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													type: "button",
													className: "size-7 text-muted-foreground hover:text-destructive",
													"aria-label": "Delete section",
													onClick: () => deleteSection(ch.id, sec.id),
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-3.5" })
												})
											]
										})
									]
								}, sec.id);
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "px-1 py-1 text-xs text-muted-foreground hover:text-foreground",
								onClick: () => addSection(ch.id),
								children: "Add section"
							}) })]
						}) : null]
					}, ch.id);
				})
			})
		})]
	});
}
function StatusDot({ chapter }) {
	const empty = chapter.sections.length === 0 ? !chapter.content.trim() : chapter.sections.some((s) => !s.content.trim());
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("size-1.5 rounded-full", empty ? "bg-muted-foreground/40" : "bg-success"),
		title: empty ? "Incomplete" : "Has content"
	});
}
function IconBtn({ children, onClick, disabled, label }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		"aria-label": label,
		disabled,
		onClick,
		className: "size-7 text-xs text-muted-foreground disabled:opacity-30",
		children
	});
}
function parseMarkdown(src) {
	const lines = src.replace(/\r\n/g, "\n").split("\n");
	const blocks = [];
	let i = 0;
	while (i < lines.length) {
		const line = lines[i];
		if (!line.trim()) {
			i += 1;
			continue;
		}
		if (line.startsWith("```")) {
			const lang = line.slice(3).trim();
			const buf = [];
			i += 1;
			while (i < lines.length && !lines[i].startsWith("```")) {
				buf.push(lines[i]);
				i += 1;
			}
			i += 1;
			blocks.push({
				type: "code",
				text: buf.join("\n"),
				lang
			});
			continue;
		}
		const h = line.match(/^(#{1,3})\s+(.+)$/);
		if (h) {
			const tag = `h${h[1].length}`;
			blocks.push({
				type: tag,
				text: h[2].trim()
			});
			i += 1;
			continue;
		}
		if (line.startsWith("> ")) {
			const buf = [line.replace(/^>\s?/, "")];
			i += 1;
			while (i < lines.length && lines[i].startsWith("> ")) {
				buf.push(lines[i].replace(/^>\s?/, ""));
				i += 1;
			}
			blocks.push({
				type: "quote",
				text: buf.join(" ")
			});
			continue;
		}
		if (/^\s*[-*•]\s+/.test(line)) {
			const items = [];
			while (i < lines.length && /^\s*[-*•]\s+/.test(lines[i])) {
				items.push(lines[i].replace(/^\s*[-*•]\s+/, ""));
				i += 1;
			}
			blocks.push({
				type: "ul",
				items
			});
			continue;
		}
		if (/^\s*\d+[.)]\s+/.test(line)) {
			const items = [];
			while (i < lines.length && /^\s*\d+[.)]\s+/.test(lines[i])) {
				items.push(lines[i].replace(/^\s*\d+[.)]\s+/, ""));
				i += 1;
			}
			blocks.push({
				type: "ol",
				items
			});
			continue;
		}
		const buf = [line];
		i += 1;
		while (i < lines.length && lines[i].trim() && !lines[i].startsWith("#") && !lines[i].startsWith("```") && !lines[i].startsWith("> ") && !/^\s*[-*•]\s+/.test(lines[i]) && !/^\s*\d+[.)]\s+/.test(lines[i])) {
			buf.push(lines[i]);
			i += 1;
		}
		blocks.push({
			type: "p",
			text: buf.join(" ").replace(/\s+/g, " ").trim()
		});
	}
	return blocks;
}
var PERSIAN_DIGITS = "۰۱۲۳۴۵۶۷۸۹";
function toPersianDigits(text) {
	return text.replace(/\d/g, (d) => PERSIAN_DIGITS[Number(d)] ?? d);
}
function bookToMarkdown(title, subtitle, author, chapters) {
	const parts = [`# ${title}`];
	if (subtitle) parts.push(`*${subtitle}*`);
	if (author) parts.push(`By ${author}`);
	parts.push("");
	for (const ch of chapters) parts.push(`# ${ch.title}`, "", ch.body, "");
	return parts.join("\n");
}
function EditorPanel({ streaming, onSelectionChange }) {
	const book = useStudio((s) => s.book);
	const selection = useStudio((s) => s.selection);
	const setContent = useStudio((s) => s.setContent);
	const patch = useStudio((s) => s.patch);
	const [preview, setPreview] = (0, import_react.useState)(false);
	const [historyOpen, setHistoryOpen] = (0, import_react.useState)(false);
	const areaRef = (0, import_react.useRef)(null);
	const node = (0, import_react.useMemo)(() => {
		if (!book || !selection) return null;
		const chapter = book.chapters.find((c) => c.id === selection.chapterId);
		if (!chapter) return null;
		return {
			chapter,
			section: selection.sectionId ? chapter.sections.find((s) => s.id === selection.sectionId) : void 0
		};
	}, [book, selection]);
	const content = streaming ?? (node?.section ? node.section.content : node?.chapter.content ?? "");
	const versions = node?.section ? node.section.versions : node?.chapter.versions ?? [];
	const rtl = book ? isRtlLanguage(book.language) : false;
	(0, import_react.useEffect)(() => {
		setHistoryOpen(false);
	}, [selection?.chapterId, selection?.sectionId]);
	if (!book || !node) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex h-full items-center justify-center bg-paper text-ink-muted",
		children: "Select a chapter to write."
	});
	const title = node.section?.title ?? node.chapter.title;
	const outline = node.section?.outline || node.chapter.outline || node.chapter.objective;
	function onSelect() {
		const el = areaRef.current;
		if (!el) return;
		onSelectionChange(el.value.slice(el.selectionStart, el.selectionEnd));
	}
	function restore(id) {
		if (!node) return;
		const next = restoreVersion(node.section ?? node.chapter, id);
		if (!next) return;
		patch((b) => ({
			...b,
			chapters: b.chapters.map((ch) => {
				if (ch.id !== node.chapter.id) return ch;
				if (node.section) return {
					...ch,
					sections: ch.sections.map((s) => s.id === node.section.id ? {
						...s,
						...next
					} : s)
				};
				return {
					...ch,
					...next
				};
			})
		}));
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full flex-col bg-paper text-ink",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-start justify-between gap-3 border-b border-ink/10 px-4 py-3 sm:px-8",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs uppercase tracking-[0.16em] text-ink-muted",
						children: node.section ? node.chapter.title : node.chapter.type
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-2xl tracking-tight text-ink",
						children: title
					}),
					outline ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 line-clamp-2 text-sm text-ink-muted",
						children: outline
					}) : null
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex shrink-0 items-center gap-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "icon-sm",
					variant: "ghost",
					className: "text-ink-muted hover:bg-ink/5 hover:text-ink",
					onClick: () => setPreview((p) => !p),
					"aria-label": "Toggle preview",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "size-4" })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "icon-sm",
					variant: "ghost",
					className: "text-ink-muted hover:bg-ink/5 hover:text-ink",
					onClick: () => setHistoryOpen((p) => !p),
					"aria-label": "Version history",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(History, { className: "size-4" })
				})]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex min-h-0 flex-1",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex min-h-0 min-w-0 flex-1 flex-col",
				children: [preview ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("article", {
					dir: rtl ? "rtl" : "ltr",
					className: cn("manuscript-editor flex-1 overflow-auto px-4 py-6 sm:px-10", rtl && "font-persian"),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MarkdownView, { text: content })
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
					ref: areaRef,
					dir: rtl ? "rtl" : "ltr",
					className: cn("manuscript-editor min-h-0 flex-1 resize-none rounded-none border-0 bg-transparent px-4 py-6 shadow-none focus-visible:ring-0 sm:px-10", rtl && "font-persian"),
					value: content,
					disabled: streaming !== null,
					onChange: (e) => setContent(e.target.value, "edit"),
					onSelect,
					onKeyUp: onSelect,
					placeholder: "Write here, or generate this chapter from the assistant."
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between border-t border-ink/10 px-4 py-2 text-xs tabular-nums text-ink-muted sm:px-8",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [wordCount(content), " words"] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: node.section?.status ?? node.chapter.status })]
				})]
			}), historyOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
				className: "w-56 shrink-0 overflow-auto border-l border-ink/10 bg-paper p-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs uppercase tracking-[0.16em] text-ink-muted",
					children: "Versions"
				}), versions.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-sm text-ink-muted",
					children: "No snapshots yet. Generates and AI edits are kept automatically."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-3 flex flex-col gap-2",
					children: [...versions].reverse().map((v) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "rounded-md border border-ink/10 p-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-ink",
								children: v.label
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[10px] text-ink-muted",
								children: new Date(v.createdAt).toLocaleString()
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 line-clamp-3 text-[11px] text-ink-muted",
								children: v.content
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								className: "mt-2 inline-flex items-center gap-1 text-xs text-ink",
								onClick: () => restore(v.id),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "size-3" }), "Restore"]
							})
						]
					}, v.id))
				})]
			}) : null]
		})]
	});
}
function MarkdownView({ text }) {
	const blocks = parseMarkdown(text || "");
	if (!text.trim()) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-ink-muted",
		children: "Nothing on the page yet."
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex flex-col gap-3",
		children: blocks.map((b, i) => {
			if (b.type === "h1") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "font-display text-xl",
				children: b.text
			}, i);
			if (b.type === "h2" || b.type === "h3") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
				className: "font-display text-lg",
				children: b.text
			}, i);
			if (b.type === "quote") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("blockquote", {
				className: "border-l-2 border-ink/20 pl-3 italic",
				children: b.text
			}, i);
			if (b.type === "code") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
				className: "overflow-auto rounded-md bg-ink/5 p-3 font-mono text-sm",
				children: b.text
			}, i);
			if (b.type === "ul") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "list-disc pl-5",
				children: b.items.map((it, j) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: it }, j))
			}, i);
			if (b.type === "ol") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
				className: "list-decimal pl-5",
				children: b.items.map((it, j) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: it }, j))
			}, i);
			return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: b.text }, i);
		})
	});
}
var ACTIONS = [
	{
		id: "generate-section",
		label: "Generate",
		icon: Sparkles
	},
	{
		id: "regenerate",
		label: "Regenerate",
		icon: RefreshCw,
		needsContent: true
	},
	{
		id: "expand",
		label: "Expand",
		icon: Expand,
		needsContent: true
	},
	{
		id: "shorten",
		label: "Shorten",
		icon: Minimize2,
		needsContent: true
	},
	{
		id: "rewrite",
		label: "Rewrite",
		icon: PenLine,
		needsContent: true
	},
	{
		id: "improve",
		label: "Improve",
		icon: WandSparkles,
		needsContent: true
	},
	{
		id: "continue",
		label: "Continue",
		icon: CornerDownRight,
		needsContent: true
	},
	{
		id: "simplify",
		label: "Simplify",
		icon: Languages,
		needsContent: true
	}
];
function AssistantPanel({ busy, selectedText, onAction, onCustom }) {
	const book = useStudio((s) => s.book);
	const node = useSelectedNode();
	const [command, setCommand] = (0, import_react.useState)("");
	if (!book) return null;
	const content = node?.section?.content ?? node?.chapter.content ?? "";
	const hasContent = Boolean(content.trim());
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full flex-col bg-card",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "border-b border-border px-3 py-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs uppercase tracking-[0.16em] text-muted-foreground",
				children: "Assistant"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 truncate text-sm",
				children: node?.section?.title ?? node?.chapter.title ?? "No selection"
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollArea, {
			className: "flex-1",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-2 p-3",
				children: [
					ACTIONS.map((a) => {
						const Icon = a.icon;
						const disabled = busy || a.needsContent && !hasContent && !selectedText;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "secondary",
							className: "justify-start",
							disabled,
							onClick: () => onAction(a.id),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4" }), a.label]
						}, a.id);
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-2 rounded-lg border border-border p-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-muted-foreground",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Terminal, { className: "size-3.5" }), "Custom command"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
								rows: 3,
								value: command,
								onChange: (e) => setCommand(e.target.value),
								placeholder: "Make this section more concrete, with a worked example."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								className: "mt-2 w-full",
								disabled: busy || !command.trim(),
								onClick: () => {
									onCustom(command.trim());
									setCommand("");
								},
								children: "Run"
							})
						]
					}),
					selectedText ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-muted-foreground",
						children: [
							"Selection: ",
							wordCount(selectedText),
							" words will be sent instead of the whole section."
						]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground",
						children: "Select text in the editor to rewrite only that passage."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UsageCard, {
						input: book.usage.inputTokens,
						output: book.usage.outputTokens,
						cost: book.usage.estimatedCostUsd,
						calls: book.usage.calls
					})
				]
			})
		})]
	});
}
function UsageCard({ input, output, cost, calls }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-2 rounded-lg border border-border p-3 text-xs text-muted-foreground",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "uppercase tracking-[0.16em]",
			children: "Usage"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
			className: "mt-2 grid grid-cols-2 gap-y-1 tabular-nums",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", { children: "Input" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
					className: "text-right text-foreground",
					children: input.toLocaleString()
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", { children: "Output" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
					className: "text-right text-foreground",
					children: output.toLocaleString()
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", { children: "Total" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
					className: "text-right text-foreground",
					children: (input + output).toLocaleString()
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", { children: "Calls" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
					className: "text-right text-foreground",
					children: calls
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", { children: "Est. cost" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", {
					className: "text-right text-foreground",
					children: ["$", cost.toFixed(3)]
				})
			]
		})]
	});
}
var Progress = import_react.forwardRef(({ className, value, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Root$1, {
	ref,
	className: cn("relative h-2 w-full overflow-hidden rounded-full bg-secondary", className),
	...props,
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Indicator, {
		className: "h-full bg-primary transition-transform duration-300 ease-out",
		style: { transform: `translateX(-${100 - (value ?? 0)}%)` }
	})
}));
Progress.displayName = Root$1.displayName;
function GenerateOverlay({ state, chapterLabel, sectionLabel, onPause, onResume, onCancel }) {
	if (state.status === "idle" || state.status === "complete") return null;
	const pct = state.totalNodes ? Math.round(state.completedNodeIds.length / state.totalNodes * 100) : 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-40 flex items-end justify-center bg-background/70 p-4 sm:items-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-lg",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs uppercase tracking-[0.16em] text-muted-foreground",
					children: "Generating book"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-2 font-display text-2xl tracking-tight",
					children: state.status === "paused" ? "Paused" : state.status === "error" ? "Stopped" : state.status === "cancelled" ? "Cancelled" : "Writing…"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: state.message || chapterLabel
				}),
				sectionLabel ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: sectionLabel
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Progress, { value: pct }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 text-xs tabular-nums text-muted-foreground",
						children: [
							state.completedNodeIds.length,
							" / ",
							state.totalNodes,
							" · ",
							pct,
							"%"
						]
					})]
				}),
				state.error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-sm text-destructive",
					children: state.error
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 flex flex-wrap gap-2",
					children: [
						state.status === "running" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "secondary",
							onClick: onPause,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "size-4" }), "Pause"]
						}) : null,
						state.status === "paused" || state.status === "error" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							onClick: onResume,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-4" }), "Resume"]
						}) : null,
						state.status !== "cancelled" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "ghost",
							onClick: onCancel,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" }), "Cancel"]
						}) : null
					]
				})
			]
		})
	});
}
var Dialog = Dialog$1;
var DialogPortal = DialogPortal$1;
var DialogOverlay = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay$1, {
	ref,
	className: cn("fixed inset-0 z-50 bg-background/70 data-[state=open]:animate-in", className),
	...props
}));
DialogOverlay.displayName = DialogOverlay$1.displayName;
var DialogContent = import_react.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent$1, {
	ref,
	className: cn("fixed left-1/2 top-1/2 z-50 grid w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 rounded-xl border border-border bg-card p-6 text-card-foreground shadow-lg", className),
	...props,
	children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogClose, {
		className: "absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "sr-only",
			children: "Close"
		})]
	})]
})] }));
DialogContent.displayName = DialogContent$1.displayName;
function DialogHeader({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("flex flex-col gap-1.5", className),
		...props
	});
}
var DialogTitle = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle$1, {
	ref,
	className: cn("font-display text-lg font-medium", className),
	...props
}));
DialogTitle.displayName = DialogTitle$1.displayName;
var DialogDescription = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription$1, {
	ref,
	className: cn("text-sm text-muted-foreground", className),
	...props
}));
DialogDescription.displayName = DialogDescription$1.displayName;
var Tabs = Root2;
var TabsList = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(List, {
	ref,
	className: cn("inline-flex h-10 items-center justify-center rounded-lg bg-secondary p-1 text-muted-foreground", className),
	...props
}));
TabsList.displayName = List.displayName;
var TabsTrigger = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trigger, {
	ref,
	className: cn("inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-colors data-[state=active]:bg-card data-[state=active]:text-foreground", className),
	...props
}));
TabsTrigger.displayName = Trigger.displayName;
var TabsContent = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content, {
	ref,
	className: cn("mt-3", className),
	...props
}));
TabsContent.displayName = Content.displayName;
var MAX_SUMMARY_CHARS = 900;
var MAX_GLOSSARY = 40;
var MAX_CONCEPTS = 24;
function localChapterSummary(chapter) {
	const parts = [];
	const body = chapterBody(chapter);
	const words = wordCount(body);
	parts.push(`${chapter.title} (${words} words).`);
	if (chapter.objective) parts.push(`Objective: ${chapter.objective}`);
	const headings = chapter.sections.map((s) => s.title).filter(Boolean);
	if (headings.length) parts.push(`Sections: ${headings.join("; ")}.`);
	const excerpt = body.replace(/\s+/g, " ").trim().slice(0, 420);
	if (excerpt) parts.push(excerpt);
	return parts.join(" ").slice(0, MAX_SUMMARY_CHARS);
}
function chapterBody(chapter) {
	if (chapter.sections.length === 0) return chapter.content ?? "";
	return chapter.sections.map((s) => `## ${s.title}\n\n${s.content}`.trim()).join("\n\n");
}
function mergeContext(current, chapter, structured) {
	const summary = structured?.chapterSummaries?.[0]?.summary || localChapterSummary(chapter);
	const summaries = [...current.chapterSummaries.filter((s) => s.chapterId !== chapter.id), {
		chapterId: chapter.id,
		title: chapter.title,
		summary
	}].slice(-16);
	const glossaryMap = /* @__PURE__ */ new Map();
	for (const g of current.glossary) glossaryMap.set(g.term.toLowerCase(), g);
	for (const g of structured?.glossary ?? []) glossaryMap.set(g.term.toLowerCase(), {
		...g,
		firstChapterId: g.firstChapterId || chapter.id
	});
	const uniq = (arr, extra = []) => [...new Set([...arr, ...extra].map((s) => s.trim()).filter(Boolean))];
	return {
		chapterSummaries: summaries,
		concepts: uniq(current.concepts, structured?.concepts).slice(0, MAX_CONCEPTS),
		glossary: [...glossaryMap.values()].slice(0, MAX_GLOSSARY),
		keyFacts: uniq(current.keyFacts, structured?.keyFacts).slice(0, 30),
		characters: mergeCharacters(current.characters, structured?.characters ?? []),
		rules: uniq(current.rules, structured?.rules).slice(0, 20),
		decisions: uniq(current.decisions, structured?.decisions).slice(0, 20),
		styleNotes: uniq(current.styleNotes, structured?.styleNotes).slice(0, 12),
		references: uniq(current.references, structured?.references).slice(0, 40),
		userInstructions: uniq(current.userInstructions, structured?.userInstructions).slice(0, 12)
	};
}
function mergeCharacters(a, b) {
	const map = /* @__PURE__ */ new Map();
	for (const c of [...a, ...b]) {
		const key = c.name.toLowerCase();
		const prev = map.get(key);
		map.set(key, {
			name: c.name,
			description: c.description || prev?.description || ""
		});
	}
	return [...map.values()].slice(0, 24);
}
function relevantContextFor(book, chapterId) {
	const ctx = book.context;
	const idx = book.chapters.findIndex((c) => c.id === chapterId);
	const previous = ctx.chapterSummaries.filter((s) => {
		const i = book.chapters.findIndex((c) => c.id === s.chapterId);
		return i >= 0 && i < idx;
	}).slice(-8);
	const blocks = [];
	if (previous.length) blocks.push("Previous chapter summaries:\n" + previous.map((s) => `- ${s.title}: ${s.summary}`).join("\n"));
	if (ctx.concepts.length) blocks.push("Important concepts: " + ctx.concepts.join("; "));
	if (ctx.glossary.length) blocks.push("Terminology:\n" + ctx.glossary.slice(0, 20).map((g) => `- ${g.term}: ${g.definition}`).join("\n"));
	if (ctx.keyFacts.length) blocks.push("Key facts: " + ctx.keyFacts.slice(0, 12).join("; "));
	if (ctx.characters.length) blocks.push("Characters:\n" + ctx.characters.map((c) => `- ${c.name}: ${c.description}`).join("\n"));
	if (ctx.rules.length) blocks.push("Rules / assumptions: " + ctx.rules.join("; "));
	if (ctx.decisions.length) blocks.push("Important decisions: " + ctx.decisions.join("; "));
	if (ctx.styleNotes.length) blocks.push("Style notes: " + ctx.styleNotes.join("; "));
	if (book.customStyleInstructions) blocks.push("Custom writing instructions: " + book.customStyleInstructions);
	if (ctx.userInstructions.length) blocks.push("User instructions: " + ctx.userInstructions.join("; "));
	return blocks.join("\n\n").slice(0, 6e3);
}
function parseStructuredContext(raw, chapterId) {
	try {
		const jsonStart = raw.indexOf("{");
		const jsonEnd = raw.lastIndexOf("}");
		if (jsonStart < 0 || jsonEnd <= jsonStart) return {};
		const data = JSON.parse(raw.slice(jsonStart, jsonEnd + 1));
		const strArr = (v) => Array.isArray(v) ? v.filter((x) => typeof x === "string") : [];
		const glossary = Array.isArray(data.glossary) ? data.glossary.map((g) => {
			if (!g || typeof g !== "object") return null;
			const rec = g;
			if (typeof rec.term !== "string") return null;
			return {
				term: rec.term,
				definition: typeof rec.definition === "string" ? rec.definition : "",
				firstChapterId: chapterId
			};
		}).filter((g) => Boolean(g)) : [];
		const characters = Array.isArray(data.characters) ? data.characters.map((c) => {
			if (!c || typeof c !== "object") return null;
			const rec = c;
			if (typeof rec.name !== "string") return null;
			return {
				name: rec.name,
				description: typeof rec.description === "string" ? rec.description : ""
			};
		}).filter((c) => Boolean(c)) : [];
		const summary = typeof data.summary === "string" ? data.summary : "";
		return {
			chapterSummaries: summary ? [{
				chapterId,
				title: "",
				summary
			}] : [],
			concepts: strArr(data.concepts),
			glossary,
			keyFacts: strArr(data.keyFacts),
			characters,
			rules: strArr(data.rules),
			decisions: strArr(data.decisions),
			styleNotes: strArr(data.styleNotes),
			references: strArr(data.references)
		};
	} catch {
		return {};
	}
}
var CHAPTER_GENERATION = `Write the full chapter below as publishable book prose in Markdown.

Book title: {{title}}
Book description: {{description}}
Target audience: {{audience}}
Writing style: {{style}}
{{styleInstructions}}
Language: {{language}}

Chapter title: {{chapterTitle}}
Chapter objective: {{chapterObjective}}
Chapter outline:
{{chapterOutline}}

{{context}}

Constraints:
{{constraints}}

{{userInstructions}}

Write the chapter now. Do not include the book title or a "Chapter X" label unless it belongs in the prose. Start with the chapter's opening paragraph or a ## heading for the first section.`;
var SECTION_GENERATION = `Write the following section as publishable book prose in Markdown.

Book title: {{title}}
Book description: {{description}}
Target audience: {{audience}}
Writing style: {{style}}
{{styleInstructions}}
Language: {{language}}

Chapter: {{chapterTitle}}
Chapter objective: {{chapterObjective}}
Section title: {{sectionTitle}}
Section / chapter outline:
{{sectionOutline}}

{{context}}

Constraints:
{{constraints}}

{{userInstructions}}

Write only this section. Do not repeat the chapter title as a heading. You may use ### subheadings if the section is long.`;
var REWRITE = `Rewrite the following book passage.

Instruction: {{action}}
Book: {{title}}
Chapter: {{chapterTitle}}
Section: {{sectionTitle}}
Style: {{style}}
Language: {{language}}
{{styleInstructions}}

{{context}}

Passage:
"""
{{selectedText}}
"""

Return only the rewritten passage in Markdown.`;
var EXPANSION = `Expand the following book passage while preserving its meaning. Add explanation, examples, and smoother transitions. Do not contradict established context.

Book: {{title}}
Chapter: {{chapterTitle}}
Style: {{style}}
Language: {{language}}

{{context}}

Passage:
"""
{{selectedText}}
"""

Return only the expanded passage in Markdown.`;
var TRANSFORM = `Transform the following book passage.

Instruction: {{action}}
Book: {{title}}
Chapter: {{chapterTitle}}
Section: {{sectionTitle}}
Style: {{style}}
Language: {{language}}
{{styleInstructions}}

{{context}}

Passage:
"""
{{selectedText}}
"""

Return only the resulting passage in Markdown.`;
var CUSTOM_COMMAND = `Apply this instruction to the book passage:

{{customCommand}}

Book: {{title}}
Chapter: {{chapterTitle}}
Section: {{sectionTitle}}
Style: {{style}}
Language: {{language}}

{{context}}

Passage:
"""
{{selectedText}}
"""

Return only the resulting passage in Markdown.`;
var SUMMARIZATION = `Extract a compact context record for later chapters of this book. Return ONLY valid JSON with this shape:
{
  "summary": "120-180 word chapter summary",
  "concepts": ["..."],
  "glossary": [{"term": "...", "definition": "..."}],
  "keyFacts": ["..."],
  "characters": [{"name": "...", "description": "..."}],
  "rules": ["..."],
  "decisions": ["..."],
  "styleNotes": ["..."],
  "references": ["only sources actually named in the chapter, never invented"]
}

Book: {{title}}
Chapter: {{chapterTitle}}

Chapter text:
"""
{{existingContent}}
"""`;
var QUALITY_CONTROL = `You are the final editor of the book "{{title}}". Review the digest of the manuscript and return ONLY JSON:
{
  "score": 0-100,
  "summary": "one paragraph",
  "issues": [
    {"severity": "info"|"warning"|"error", "title": "...", "detail": "...", "category": "repetition|terminology|structure|logic|references|transition|completeness|style", "chapter": "optional title"}
  ]
}

Do not invent problems. Be specific.

Manuscript digest:
{{digest}}`;
var CONSISTENCY_CHECK = `Check the book "{{title}}" for consistency of terminology, character facts, timeline, and claims. Return ONLY JSON:
{
  "issues": [
    {"severity": "info"|"warning"|"error", "title": "...", "detail": "...", "category": "terminology|contradiction|character|timeline|style"}
  ]
}

Digest:
{{digest}}`;
function renderTemplate(template, vars) {
	return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? "");
}
function styleLabel(book) {
	return WRITING_STYLES.find((s) => s.id === book.writingStyle)?.label ?? book.writingStyle;
}
function languageName(book) {
	if (book.language === "other") return book.customLanguage || "the specified language";
	return {
		en: "English",
		fa: "Persian (Farsi)",
		ar: "Arabic",
		de: "German",
		fr: "French",
		es: "Spanish"
	}[book.language] ?? "English";
}
function baseVars(book, chapter, section) {
	const sectionOutline = section?.outline || chapter.sections.map((s) => `- ${s.title}${s.outline ? `: ${s.outline}` : ""}`).join("\n");
	return {
		title: book.title,
		subtitle: book.subtitle,
		author: book.author,
		description: book.description,
		audience: book.targetAudience,
		style: styleLabel(book),
		styleInstructions: book.customStyleInstructions,
		language: languageName(book),
		chapterTitle: chapter.title,
		chapterObjective: chapter.objective,
		chapterOutline: chapter.outline,
		sectionTitle: section?.title ?? "",
		sectionOutline,
		context: relevantContextFor(book, chapter.id),
		constraints: "Do not invent citations, DOIs, quotations, or sources. If a claim needs a source, mark it as [verification required]. Keep terminology consistent with the glossary. Do not recap the entire book. Write only the requested content.",
		userInstructions: book.context.userInstructions.join("\n"),
		existingContent: section ? section.content : chapter.content
	};
}
function getTemplate(book, name, fallback) {
	return book.promptOverrides[name] || fallback;
}
function buildSystemPrompt(book) {
	const custom = book.ai.systemPrompt.trim();
	const base = `You are a professional book writer working inside Folio, an AI book studio.
Write in ${languageName(book)}.
Voice: ${styleLabel(book)}.
${book.customStyleInstructions ? `Additional voice notes: ${book.customStyleInstructions}` : ""}
Target audience: ${book.targetAudience}.
Output clean Markdown. Use ## / ### for subheadings when useful, short paragraphs, and no preamble about being an AI.
Never fabricate references, DOIs, quotations, URLs, or page numbers.
If a fact cannot be verified from the provided material, write [verification required] rather than inventing a source.`;
	return custom ? `${base}\n\n${custom}` : base;
}
function buildGenerationPrompt(book, chapter, section) {
	const vars = baseVars(book, chapter, section);
	const template = section ? getTemplate(book, "section_generation", SECTION_GENERATION) : getTemplate(book, "chapter_generation", CHAPTER_GENERATION);
	return {
		system: buildSystemPrompt(book),
		user: renderTemplate(template, vars)
	};
}
function buildActionPrompt(book, chapter, action, options = {}) {
	const vars = {
		...baseVars(book, chapter, options.section),
		selectedText: options.selectedText || options.section?.content || chapter.content,
		customCommand: options.customCommand ?? ""
	};
	let template = TRANSFORM;
	if (action === "expand") template = getTemplate(book, "expansion", EXPANSION);
	else if (action === "rewrite" || action === "regenerate") template = getTemplate(book, "rewrite", REWRITE);
	else if (action === "custom") template = getTemplate(book, "custom", CUSTOM_COMMAND);
	else template = getTemplate(book, "transform", TRANSFORM);
	vars.action = {
		expand: "Expand the text while preserving meaning. Add depth, examples, and transitions.",
		shorten: "Make the text more concise without losing essential meaning.",
		rewrite: "Rewrite the text, preserving meaning, improving flow and voice.",
		regenerate: "Write a fresh version of this content from the outline, replacing the current draft.",
		improve: "Improve clarity, structure, grammar, and readability. Keep the meaning.",
		continue: "Continue writing from the end of the current text in the same voice.",
		simplify: "Explain the same ideas in simpler language for a less expert reader.",
		custom: options.customCommand || "Follow the user's instruction."
	}[action] ?? action;
	return {
		system: buildSystemPrompt(book),
		user: renderTemplate(template, vars)
	};
}
function buildSummarizePrompt(book, chapter, body) {
	const vars = {
		...baseVars(book, chapter),
		existingContent: body.slice(0, 8e3)
	};
	return {
		system: buildSystemPrompt(book),
		user: renderTemplate(getTemplate(book, "summarization", SUMMARIZATION), vars)
	};
}
function buildQualityPrompt(book, digest) {
	return {
		system: buildSystemPrompt(book),
		user: renderTemplate(getTemplate(book, "quality_control", QUALITY_CONTROL), {
			title: book.title,
			digest
		})
	};
}
var PROMPT_CATALOG = [
	{
		id: "chapter_generation",
		label: "Chapter generation",
		body: CHAPTER_GENERATION
	},
	{
		id: "section_generation",
		label: "Section generation",
		body: SECTION_GENERATION
	},
	{
		id: "rewrite",
		label: "Rewrite",
		body: REWRITE
	},
	{
		id: "expansion",
		label: "Expand",
		body: EXPANSION
	},
	{
		id: "transform",
		label: "Transform",
		body: TRANSFORM
	},
	{
		id: "summarization",
		label: "Summarization",
		body: SUMMARIZATION
	},
	{
		id: "quality_control",
		label: "Quality control",
		body: QUALITY_CONTROL
	},
	{
		id: "consistency_check",
		label: "Consistency check",
		body: CONSISTENCY_CHECK
	},
	{
		id: "custom",
		label: "Custom command",
		body: CUSTOM_COMMAND
	}
];
function SettingsDialog({ open, onOpenChange }) {
	const book = useStudio((s) => s.book);
	const patch = useStudio((s) => s.patch);
	const [key, setKey] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		if (!open || !book) return;
		getApiKey(book.ai.id).then(setKey);
	}, [open, book?.ai.id]);
	if (!book) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "max-h-[90dvh] max-w-2xl overflow-auto",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Manuscript settings" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Voice, engine, press, sources, and prompt templates." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
				defaultValue: "voice",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
						className: "flex flex-wrap h-auto",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: "voice",
								children: "Voice"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: "engine",
								children: "Engine"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: "press",
								children: "Press"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: "sources",
								children: "Sources"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: "prompts",
								children: "Prompts"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
						value: "voice",
						className: "flex flex-col gap-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Title",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: book.title,
									onChange: (e) => patch((b) => ({
										...b,
										title: e.target.value
									}))
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Author",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: book.author,
									onChange: (e) => patch((b) => ({
										...b,
										author: e.target.value
									}))
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Description",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
									rows: 4,
									value: book.description,
									onChange: (e) => patch((b) => ({
										...b,
										description: e.target.value
									}))
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Audience",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: book.targetAudience,
									onChange: (e) => patch((b) => ({
										...b,
										targetAudience: e.target.value
									}))
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Language",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
									className: "h-10 rounded-md border border-input bg-background px-3 text-sm",
									value: book.language,
									onChange: (e) => patch((b) => ({
										...b,
										language: e.target.value
									})),
									children: LANGUAGES.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: l.id,
										children: l.label
									}, l.id))
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Style",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
									className: "h-10 rounded-md border border-input bg-background px-3 text-sm",
									value: book.writingStyle,
									onChange: (e) => patch((b) => ({
										...b,
										writingStyle: e.target.value
									})),
									children: WRITING_STYLES.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: s.id,
										children: s.label
									}, s.id))
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Custom writing instructions",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
									rows: 4,
									value: book.customStyleInstructions,
									onChange: (e) => patch((b) => ({
										...b,
										customStyleInstructions: e.target.value
									}))
								})
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
						value: "engine",
						className: "flex flex-col gap-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Provider",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
									className: "h-10 rounded-md border border-input bg-background px-3 text-sm",
									value: book.ai.kind,
									onChange: (e) => patch((b) => ({
										...b,
										ai: {
											...b.ai,
											kind: e.target.value
										}
									})),
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "xai",
											children: "Grok (xAI)"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "openai-compatible",
											children: "OpenAI-compatible"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "custom",
											children: "Custom API"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "local",
											children: "Local LLM"
										})
									]
								})
							}),
							book.ai.kind !== "xai" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Base URL",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: book.ai.baseUrl,
									onChange: (e) => patch((b) => ({
										...b,
										ai: {
											...b.ai,
											baseUrl: e.target.value
										}
									}))
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "API key",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									type: "password",
									autoComplete: "off",
									value: key,
									onChange: (e) => setKey(e.target.value),
									onBlur: () => void saveApiKey(book.ai.id, key)
								})
							})] }) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Model",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: book.ai.model,
									onChange: (e) => patch((b) => ({
										...b,
										ai: {
											...b.ai,
											model: e.target.value
										}
									}))
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: `Temperature ${book.ai.temperature.toFixed(1)}`,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
									min: 0,
									max: 1.2,
									step: .1,
									value: [book.ai.temperature],
									onValueChange: (v) => patch((b) => ({
										...b,
										ai: {
											...b.ai,
											temperature: v[0] ?? .7
										}
									}))
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: `Max tokens ${book.ai.maxOutputTokens}`,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
									min: 400,
									max: 8e3,
									step: 100,
									value: [book.ai.maxOutputTokens],
									onValueChange: (v) => patch((b) => ({
										...b,
										ai: {
											...b.ai,
											maxOutputTokens: v[0] ?? 2500
										}
									}))
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "System prompt addendum",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
									rows: 4,
									value: book.ai.systemPrompt,
									onChange: (e) => patch((b) => ({
										...b,
										ai: {
											...b.ai,
											systemPrompt: e.target.value
										}
									}))
								})
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
						value: "press",
						className: "flex flex-col gap-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "grid gap-3 sm:grid-cols-2",
								children: [
									["bodyFont", "Body font"],
									["heading1Font", "Heading 1 font"],
									["heading2Font", "Heading 2 font"],
									["heading3Font", "Heading 3 font"]
								].map(([keyName, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
										className: "h-10 rounded-md border border-input bg-background px-3 text-sm",
										value: book.formatting[keyName],
										onChange: (e) => patch((b) => ({
											...b,
											formatting: {
												...b.formatting,
												[keyName]: e.target.value
											}
										})),
										children: FONT_CHOICES.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: f }, f))
									})
								}, keyName))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid gap-3 sm:grid-cols-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
										label: "Body size (pt)",
										value: book.formatting.bodySize,
										onChange: (n) => patch((b) => ({
											...b,
											formatting: {
												...b.formatting,
												bodySize: n
											}
										}))
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
										label: "Line spacing",
										value: book.formatting.lineSpacing,
										step: .1,
										onChange: (n) => patch((b) => ({
											...b,
											formatting: {
												...b.formatting,
												lineSpacing: n
											}
										}))
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
										label: "First-line indent (in)",
										value: book.formatting.firstLineIndent,
										step: .05,
										onChange: (n) => patch((b) => ({
											...b,
											formatting: {
												...b.formatting,
												firstLineIndent: n
											}
										}))
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Alignment",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
											className: "h-10 rounded-md border border-input bg-background px-3 text-sm",
											value: book.formatting.alignment,
											onChange: (e) => patch((b) => ({
												...b,
												formatting: {
													...b.formatting,
													alignment: e.target.value
												}
											})),
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "left",
													children: "Left"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "justify",
													children: "Justify"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "right",
													children: "Right"
												})
											]
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Page size",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
											className: "h-10 rounded-md border border-input bg-background px-3 text-sm",
											value: book.formatting.pageSize,
											onChange: (e) => patch((b) => ({
												...b,
												formatting: {
													...b.formatting,
													pageSize: e.target.value
												}
											})),
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "a4",
													children: "A4"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "letter",
													children: "US Letter"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "legal",
													children: "Legal"
												})
											]
										})
									}),
									[
										"marginTop",
										"marginBottom",
										"marginLeft",
										"marginRight"
									].map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
										label: m.replace("margin", "Margin ") + " (in)",
										value: book.formatting[m],
										step: .05,
										onChange: (n) => patch((b) => ({
											...b,
											formatting: {
												...b.formatting,
												[m]: n
											}
										}))
									}, m))
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Header",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: book.formatting.headerText,
									onChange: (e) => patch((b) => ({
										...b,
										formatting: {
											...b.formatting,
											headerText: e.target.value
										}
									}))
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Footer",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: book.formatting.footerText,
									onChange: (e) => patch((b) => ({
										...b,
										formatting: {
											...b.formatting,
											footerText: e.target.value
										}
									}))
								})
							}),
							[
								["coverPage", "Cover page"],
								["tableOfContents", "Table of contents"],
								["pageNumbers", "Page numbers"],
								["chapterPageBreaks", "Chapter page breaks"],
								["persianNumbers", "Persian digits"]
							].map(([k, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "flex items-center justify-between text-sm",
								children: [label, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
									checked: book.formatting[k],
									onCheckedChange: (v) => patch((b) => ({
										...b,
										formatting: {
											...b.formatting,
											[k]: v
										}
									}))
								})]
							}, k))
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
						value: "sources",
						className: "flex flex-col gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted-foreground",
								children: "Sources you add here may be cited. The writer is forbidden from inventing DOIs, URLs, or quotations."
							}),
							book.references.map((ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-lg border border-border p-3 grid gap-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										placeholder: "Title",
										value: ref.title,
										onChange: (e) => patch((b) => ({
											...b,
											references: b.references.map((r) => r.id === ref.id ? {
												...r,
												title: e.target.value
											} : r)
										}))
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "grid grid-cols-2 gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											placeholder: "Author",
											value: ref.author,
											onChange: (e) => patch((b) => ({
												...b,
												references: b.references.map((r) => r.id === ref.id ? {
													...r,
													author: e.target.value
												} : r)
											}))
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											placeholder: "Year",
											value: ref.year,
											onChange: (e) => patch((b) => ({
												...b,
												references: b.references.map((r) => r.id === ref.id ? {
													...r,
													year: e.target.value
												} : r)
											}))
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										placeholder: "URL",
										value: ref.url,
										onChange: (e) => patch((b) => ({
											...b,
											references: b.references.map((r) => r.id === ref.id ? {
												...r,
												url: e.target.value
											} : r)
										}))
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										placeholder: "DOI",
										value: ref.doi,
										onChange: (e) => patch((b) => ({
											...b,
											references: b.references.map((r) => r.id === ref.id ? {
												...r,
												doi: e.target.value
											} : r)
										}))
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "flex items-center gap-2 text-sm",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
											checked: ref.verified,
											onCheckedChange: (v) => patch((b) => ({
												...b,
												references: b.references.map((r) => r.id === ref.id ? {
													...r,
													verified: v
												} : r)
											}))
										}), "Verified by me"]
									})
								]
							}, ref.id)),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "secondary",
								onClick: () => patch((b) => ({
									...b,
									includeReferences: true,
									references: [...b.references, {
										id: uid("ref"),
										title: "",
										author: "",
										year: "",
										url: "",
										doi: "",
										notes: "",
										verified: false
									}]
								})),
								children: "Add source"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
						value: "prompts",
						className: "flex flex-col gap-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm text-muted-foreground",
							children: [
								"Templates use ",
								"{{title}}",
								" style variables. Leave blank to use the built-in version."
							]
						}), PROMPT_CATALOG.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: t.label,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
								rows: 6,
								className: "font-mono text-xs",
								value: book.promptOverrides[t.id] ?? t.body,
								onChange: (e) => patch((b) => ({
									...b,
									promptOverrides: {
										...b.promptOverrides,
										[t.id]: e.target.value
									}
								}))
							})
						}, t.id))]
					})
				]
			})]
		})
	});
}
function NumField({ label, value, onChange, step = 1 }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
		label,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
			type: "number",
			step,
			value,
			onChange: (e) => onChange(Number(e.target.value))
		})
	});
}
function QualityPanel({ open, onOpenChange, onRunAi, busy }) {
	const book = useStudio((s) => s.book);
	const report = book?.qualityReport;
	if (!book) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "max-h-[90dvh] max-w-lg overflow-auto",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Quality control" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Structural checks run on this device. Optional AI review looks for style and contradictions." })] }),
				report ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "font-display text-4xl tabular-nums",
						children: [report.score, "/100"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-muted-foreground",
						children: report.summary
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-4 flex flex-col gap-2",
						children: report.issues.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
							className: "text-sm text-muted-foreground",
							children: "No issues found."
						}) : report.issues.map((iss) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "rounded-lg border border-border p-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "flex items-center gap-2 text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("size-1.5 rounded-full", iss.severity === "error" ? "bg-destructive" : iss.severity === "warning" ? "bg-primary" : "bg-muted-foreground") }), iss.title]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-xs text-muted-foreground",
								children: iss.detail
							})]
						}, iss.id))
					})
				] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "Run a check to score this manuscript."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					disabled: busy,
					onClick: onRunAi,
					children: busy ? "Reviewing…" : "Run AI review"
				})
			]
		})
	});
}
async function toCompleteRequest(book, messages, maxTokens) {
	const apiKey = book.ai.kind === "xai" ? "" : await getApiKey(book.ai.id);
	return {
		provider: book.ai.kind,
		model: book.ai.model,
		temperature: book.ai.temperature,
		maxTokens: maxTokens ?? book.ai.maxOutputTokens,
		messages,
		baseUrl: book.ai.kind === "xai" ? void 0 : book.ai.baseUrl,
		apiKey: apiKey || void 0,
		headers: book.ai.customHeaders
	};
}
async function generateNode(book, chapter, section, onDelta) {
	const prompt = buildGenerationPrompt(book, chapter, section);
	const req = await toCompleteRequest(book, [{
		role: "system",
		content: prompt.system
	}, {
		role: "user",
		content: prompt.user
	}]);
	const result = await streamComplete(req, onDelta);
	if (!result.ok) return {
		error: result.error,
		retryable: result.retryable
	};
	return {
		text: result.text.trim(),
		usage: addUsage(book.usage, result.usage)
	};
}
async function runAiAction(book, chapter, action, options) {
	const prompt = buildActionPrompt(book, chapter, action, options);
	const req = await toCompleteRequest(book, [{
		role: "system",
		content: prompt.system
	}, {
		role: "user",
		content: prompt.user
	}]);
	const result = await streamComplete(req, options.onDelta);
	if (!result.ok) return {
		error: result.error,
		retryable: result.retryable
	};
	return {
		text: result.text.trim(),
		usage: addUsage(book.usage, result.usage)
	};
}
async function summarizeChapter(book, chapter) {
	const body = chapterBody(chapter);
	if (!body.trim()) return book.context;
	const prompt = buildSummarizePrompt(book, chapter, body);
	const req = await toCompleteRequest(book, [{
		role: "system",
		content: prompt.system
	}, {
		role: "user",
		content: prompt.user
	}], 700);
	const result = await streamComplete(req, () => {});
	if (!result.ok) return mergeContext(book.context, {
		...chapter,
		summary: body.slice(0, 400)
	});
	const structured = parseStructuredContext(result.text, chapter.id);
	return mergeContext(book.context, chapter, structured);
}
function applyGenerated(book, chapterId, sectionId, text, usage) {
	return {
		...book,
		usage,
		chapters: book.chapters.map((ch) => {
			if (ch.id !== chapterId) return ch;
			if (sectionId) {
				const sections = ch.sections.map((s) => s.id === sectionId ? {
					...s,
					content: text,
					status: "generated",
					versions: pushVersion(s.versions, s.content, "generate")
				} : s);
				const allDone = sections.every((s) => s.content.trim());
				return {
					...ch,
					sections,
					status: allDone ? "generated" : ch.status
				};
			}
			return {
				...ch,
				content: text,
				status: "generated",
				versions: pushVersion(ch.versions, ch.content, "generate")
			};
		})
	};
}
function ngrams(text, n) {
	const words = text.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, " ").split(/\s+/).filter(Boolean);
	const map = /* @__PURE__ */ new Map();
	for (let i = 0; i <= words.length - n; i++) {
		const g = words.slice(i, i + n).join(" ");
		map.set(g, (map.get(g) ?? 0) + 1);
	}
	return map;
}
function runHeuristicQuality(book) {
	const issues = [];
	for (const ch of book.chapters) {
		const body = chapterBody(ch);
		const words = wordCount(body);
		if (!body.trim()) {
			issues.push({
				id: uid("iss"),
				severity: "error",
				chapterId: ch.id,
				title: `${ch.title} is empty`,
				detail: "This chapter has no generated or written content.",
				category: "completeness"
			});
			continue;
		}
		if (words < 120) issues.push({
			id: uid("iss"),
			severity: "warning",
			chapterId: ch.id,
			title: `${ch.title} is very short`,
			detail: `Only ${words} words. A full chapter usually needs more development.`,
			category: "completeness"
		});
		for (const sec of ch.sections) if (!sec.content.trim()) issues.push({
			id: uid("iss"),
			severity: "error",
			chapterId: ch.id,
			sectionId: sec.id,
			title: `Missing section: ${sec.title}`,
			detail: `Section “${sec.title}” in ${ch.title} is empty.`,
			category: "completeness"
		});
		else if (wordCount(sec.content) < 60) issues.push({
			id: uid("iss"),
			severity: "warning",
			chapterId: ch.id,
			sectionId: sec.id,
			title: `Thin section: ${sec.title}`,
			detail: `“${sec.title}” is only ${wordCount(sec.content)} words.`,
			category: "structure"
		});
		const repeats = [...ngrams(body, 8).entries()].filter(([, n]) => n >= 3).slice(0, 3);
		for (const [phrase] of repeats) issues.push({
			id: uid("iss"),
			severity: "warning",
			chapterId: ch.id,
			title: `Repeated phrasing in ${ch.title}`,
			detail: `The phrase “${phrase}” appears several times.`,
			category: "repetition"
		});
		if (body.includes("[verification required]")) issues.push({
			id: uid("iss"),
			severity: "info",
			chapterId: ch.id,
			title: `Unverified claims in ${ch.title}`,
			detail: "This chapter marks claims that still need a source.",
			category: "references"
		});
	}
	const bodies = book.chapters.map((ch) => ({
		ch,
		body: chapterBody(ch)
	}));
	for (let i = 0; i < bodies.length; i++) for (let j = i + 1; j < bodies.length; j++) {
		const a = ngrams(bodies[i].body, 10);
		let shared = 0;
		let sample = "";
		for (const [g, n] of ngrams(bodies[j].body, 10)) if ((a.get(g) ?? 0) > 0 && n > 0) {
			shared += 1;
			if (!sample) sample = g;
		}
		if (shared >= 4) issues.push({
			id: uid("iss"),
			severity: "warning",
			chapterId: bodies[j].ch.id,
			title: "Possible repeated passage",
			detail: `${bodies[i].ch.title} and ${bodies[j].ch.title} share similar wording (e.g. “${sample}”).`,
			category: "repetition"
		});
	}
	for (const term of book.context.glossary) {
		const needle = term.term;
		if (needle.length < 4) continue;
		const variant = needle.toLowerCase();
		let hits = 0;
		for (const { body } of bodies) if (body.toLowerCase().includes(variant)) hits += 1;
		if (hits === 0 && bodies.some((b) => b.body.trim())) issues.push({
			id: uid("iss"),
			severity: "info",
			title: `Unused glossary term: ${needle}`,
			detail: "This term is in the book glossary but does not appear in the manuscript.",
			category: "terminology"
		});
	}
	if (book.includeIntroduction && !book.chapters.some((c) => c.type === "introduction")) issues.push({
		id: uid("iss"),
		severity: "warning",
		title: "Introduction missing",
		detail: "The project is set to include an introduction, but none exists.",
		category: "structure"
	});
	if (book.includeConclusion && !book.chapters.some((c) => c.type === "conclusion")) issues.push({
		id: uid("iss"),
		severity: "warning",
		title: "Conclusion missing",
		detail: "The project is set to include a conclusion, but none exists.",
		category: "structure"
	});
	const errors = issues.filter((i) => i.severity === "error").length;
	const warnings = issues.filter((i) => i.severity === "warning").length;
	const score = Math.max(0, Math.min(100, 100 - errors * 12 - warnings * 4));
	const summary = issues.length === 0 ? "No structural issues found. Review the prose once more before export." : `Found ${errors} blocking issue${errors === 1 ? "" : "s"} and ${warnings} warning${warnings === 1 ? "" : "s"}.`;
	return {
		score,
		createdAt: Date.now(),
		issues,
		summary
	};
}
function manuscriptDigest(book, limit = 9e3) {
	const parts = [
		`Title: ${book.title}`,
		`Description: ${book.description}`,
		`Style: ${book.writingStyle}`,
		`Audience: ${book.targetAudience}`
	];
	for (const ch of book.chapters) {
		const body = chapterBody(ch);
		parts.push(`\n# ${ch.title}\n${body.slice(0, 900)}`);
	}
	return parts.join("\n").slice(0, limit);
}
function pageSize(kind) {
	if (kind === "letter") return {
		width: 12240,
		height: 15840
	};
	if (kind === "legal") return {
		width: 12240,
		height: 20160
	};
	return {
		width: 11906,
		height: 16838
	};
}
function align(value, rtl) {
	if (value === "justify") return AlignmentType.BOTH;
	if (value === "right") return AlignmentType.RIGHT;
	return rtl ? AlignmentType.RIGHT : AlignmentType.LEFT;
}
function headingAlign(rtl) {
	return rtl ? AlignmentType.RIGHT : AlignmentType.LEFT;
}
function runsFromInline(text, font, sizePt, rtl, persianNumbers) {
	const prepared = persianNumbers ? toPersianDigits(text) : text;
	const parts = prepared.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g).filter(Boolean);
	if (parts.length === 0) return [new TextRun({
		text: prepared,
		font,
		size: sizePt * 2,
		rightToLeft: rtl
	})];
	return parts.map((part) => {
		if (part.startsWith("**") && part.endsWith("**")) return new TextRun({
			text: part.slice(2, -2),
			font,
			size: sizePt * 2,
			bold: true,
			rightToLeft: rtl
		});
		if (part.startsWith("*") && part.endsWith("*")) return new TextRun({
			text: part.slice(1, -1),
			font,
			size: sizePt * 2,
			italics: true,
			rightToLeft: rtl
		});
		if (part.startsWith("`") && part.endsWith("`")) return new TextRun({
			text: part.slice(1, -1),
			font: "Courier New",
			size: sizePt * 2,
			rightToLeft: false
		});
		return new TextRun({
			text: part,
			font,
			size: sizePt * 2,
			rightToLeft: rtl
		});
	});
}
function blocksToParagraphs(blocks, book, rtl) {
	const f = book.formatting;
	const bodyAlign = align(f.alignment, rtl);
	const paras = [];
	for (const block of blocks) {
		if (block.type === "h1" || block.type === "h2" || block.type === "h3") {
			const level = block.type === "h1" ? HeadingLevel.HEADING_2 : block.type === "h2" ? HeadingLevel.HEADING_3 : HeadingLevel.HEADING_3;
			const font = block.type === "h1" ? f.heading2Font : f.heading3Font;
			const size = block.type === "h1" ? f.heading2Size : f.heading3Size;
			paras.push(new Paragraph({
				heading: level,
				bidirectional: rtl,
				alignment: headingAlign(rtl),
				spacing: {
					before: f.headingSpacingBefore * 20,
					after: f.headingSpacingAfter * 20
				},
				children: runsFromInline(block.text, font, size, rtl, f.persianNumbers)
			}));
			continue;
		}
		if (block.type === "quote") {
			paras.push(new Paragraph({
				bidirectional: rtl,
				alignment: bodyAlign,
				indent: { left: convertInchesToTwip(.3) },
				spacing: { after: f.paragraphSpacing * 20 },
				children: runsFromInline(block.text, f.bodyFont, f.bodySize, rtl, f.persianNumbers)
			}));
			continue;
		}
		if (block.type === "code") {
			for (const line of (block.text || " ").split("\n")) paras.push(new Paragraph({
				alignment: AlignmentType.LEFT,
				spacing: {
					after: 40,
					line: 276
				},
				children: [new TextRun({
					text: line || " ",
					font: "Courier New",
					size: Math.max(18, f.bodySize * 2 - 4)
				})]
			}));
			continue;
		}
		if (block.type === "ul" || block.type === "ol") {
			block.items.forEach((item, idx) => {
				paras.push(new Paragraph({
					bidirectional: rtl,
					alignment: bodyAlign,
					numbering: {
						reference: block.type === "ul" ? "folio-ul" : "folio-ol",
						level: 0
					},
					spacing: { after: 80 },
					children: runsFromInline(block.type === "ol" ? item : item, f.bodyFont, f.bodySize, rtl, f.persianNumbers)
				}));
			});
			continue;
		}
		paras.push(new Paragraph({
			bidirectional: rtl,
			alignment: bodyAlign,
			indent: f.firstLineIndent ? { firstLine: convertInchesToTwip(f.firstLineIndent) } : void 0,
			spacing: {
				after: f.paragraphSpacing * 20,
				line: Math.round(f.lineSpacing * 240)
			},
			children: runsFromInline(block.text, f.bodyFont, f.bodySize, rtl, f.persianNumbers)
		}));
	}
	return paras;
}
function chapterHeading(chapter, book, rtl) {
	const f = book.formatting;
	const label = chapter.type === "chapter" ? chapter.title : chapter.title;
	return new Paragraph({
		heading: HeadingLevel.HEADING_1,
		pageBreakBefore: f.chapterPageBreaks,
		bidirectional: rtl,
		alignment: headingAlign(rtl),
		spacing: {
			before: 240,
			after: 200
		},
		children: runsFromInline(label, f.heading1Font, f.heading1Size, rtl, f.persianNumbers)
	});
}
async function buildDocx(book) {
	const rtl = isRtlLanguage(book.language);
	const f = book.formatting;
	const size = pageSize(f.pageSize);
	const children = [];
	if (f.coverPage) {
		children.push(new Paragraph({ spacing: { before: 1600 } }), new Paragraph({
			bidirectional: rtl,
			alignment: AlignmentType.CENTER,
			spacing: { after: 200 },
			children: [new TextRun({
				text: f.persianNumbers ? toPersianDigits(book.title) : book.title,
				font: f.heading1Font,
				size: 56,
				bold: true,
				rightToLeft: rtl
			})]
		}));
		if (book.subtitle) children.push(new Paragraph({
			bidirectional: rtl,
			alignment: AlignmentType.CENTER,
			spacing: { after: 400 },
			children: [new TextRun({
				text: book.subtitle,
				font: f.bodyFont,
				size: 28,
				italics: true,
				rightToLeft: rtl
			})]
		}));
		if (book.author) children.push(new Paragraph({
			bidirectional: rtl,
			alignment: AlignmentType.CENTER,
			spacing: { before: 400 },
			children: [new TextRun({
				text: book.author,
				font: f.bodyFont,
				size: 24,
				rightToLeft: rtl
			})]
		}));
		if (book.description) children.push(new Paragraph({
			bidirectional: rtl,
			alignment: AlignmentType.CENTER,
			spacing: { before: 600 },
			indent: {
				left: convertInchesToTwip(.8),
				right: convertInchesToTwip(.8)
			},
			children: [new TextRun({
				text: book.description,
				font: f.bodyFont,
				size: 22,
				rightToLeft: rtl
			})]
		}));
	}
	if (f.tableOfContents) children.push(new Paragraph({
		heading: HeadingLevel.HEADING_1,
		pageBreakBefore: true,
		bidirectional: rtl,
		alignment: headingAlign(rtl),
		children: [new TextRun({
			text: rtl && book.language === "fa" ? "فهرست مطالب" : book.language === "ar" ? "جدول المحتويات" : "Contents",
			font: f.heading1Font,
			size: f.heading1Size * 2,
			rightToLeft: rtl
		})]
	}), new TableOfContents("Contents", {
		hyperlink: true,
		headingStyleRange: "1-3"
	}));
	for (const chapter of book.chapters) {
		children.push(chapterHeading(chapter, book, rtl));
		if (chapter.sections.length === 0) children.push(...blocksToParagraphs(parseMarkdown(chapter.content || ""), book, rtl));
		else {
			if (chapter.content.trim()) children.push(...blocksToParagraphs(parseMarkdown(chapter.content), book, rtl));
			for (const section of chapter.sections) {
				children.push(new Paragraph({
					heading: HeadingLevel.HEADING_2,
					bidirectional: rtl,
					alignment: headingAlign(rtl),
					spacing: {
						before: f.headingSpacingBefore * 20,
						after: f.headingSpacingAfter * 20
					},
					children: runsFromInline(section.title, f.heading2Font, f.heading2Size, rtl, f.persianNumbers)
				}));
				children.push(...blocksToParagraphs(parseMarkdown(section.content || ""), book, rtl));
			}
		}
	}
	if (book.includeReferences && book.references.length) {
		children.push(new Paragraph({
			heading: HeadingLevel.HEADING_1,
			pageBreakBefore: f.chapterPageBreaks,
			bidirectional: rtl,
			alignment: headingAlign(rtl),
			children: [new TextRun({
				text: book.language === "fa" ? "منابع" : "References",
				font: f.heading1Font,
				size: f.heading1Size * 2,
				rightToLeft: rtl
			})]
		}));
		for (const ref of book.references) {
			const bits = [
				ref.author,
				ref.year && `(${ref.year})`,
				ref.title,
				ref.url,
				ref.doi && `DOI: ${ref.doi}`
			].filter(Boolean).join(". ");
			const note = ref.verified ? bits : `${bits} [verification required]`;
			children.push(new Paragraph({
				bidirectional: rtl,
				spacing: { after: 160 },
				children: runsFromInline(note, f.bodyFont, f.bodySize, rtl, f.persianNumbers)
			}));
		}
	}
	const header = f.headerText ? new Header({ children: [new Paragraph({
		bidirectional: rtl,
		alignment: AlignmentType.CENTER,
		children: [new TextRun({
			text: f.headerText || book.title,
			font: f.bodyFont,
			size: 18,
			italics: true,
			rightToLeft: rtl
		})]
	})] }) : void 0;
	const footer = new Footer({ children: [new Paragraph({
		alignment: AlignmentType.CENTER,
		children: f.pageNumbers ? [new TextRun({
			text: f.footerText ? `${f.footerText} · ` : "",
			font: f.bodyFont,
			size: 18
		}), new TextRun({
			children: [PageNumber.CURRENT],
			font: f.bodyFont,
			size: 18
		})] : f.footerText ? [new TextRun({
			text: f.footerText,
			font: f.bodyFont,
			size: 18
		})] : [new TextRun({
			text: " ",
			font: f.bodyFont,
			size: 18
		})]
	})] });
	const doc = new File({
		title: book.title,
		creator: book.author || "Folio",
		description: book.description,
		features: { updateFields: true },
		styles: {
			default: { document: {
				run: {
					font: f.bodyFont,
					rightToLeft: rtl
				},
				paragraph: { alignment: rtl ? AlignmentType.RIGHT : AlignmentType.LEFT }
			} },
			paragraphStyles: [
				{
					id: "Heading1",
					name: "Heading 1",
					basedOn: "Normal",
					next: "Normal",
					quickFormat: true,
					paragraph: {
						spacing: {
							before: 360,
							after: 200
						},
						outlineLevel: 0
					},
					run: {
						font: f.heading1Font,
						size: f.heading1Size * 2,
						bold: true,
						rightToLeft: rtl
					}
				},
				{
					id: "Heading2",
					name: "Heading 2",
					basedOn: "Normal",
					next: "Normal",
					quickFormat: true,
					paragraph: {
						spacing: {
							before: 280,
							after: 140
						},
						outlineLevel: 1
					},
					run: {
						font: f.heading2Font,
						size: f.heading2Size * 2,
						bold: true,
						rightToLeft: rtl
					}
				},
				{
					id: "Heading3",
					name: "Heading 3",
					basedOn: "Normal",
					next: "Normal",
					quickFormat: true,
					paragraph: {
						spacing: {
							before: 200,
							after: 120
						},
						outlineLevel: 2
					},
					run: {
						font: f.heading3Font,
						size: f.heading3Size * 2,
						bold: true,
						rightToLeft: rtl
					}
				}
			]
		},
		numbering: { config: [{
			reference: "folio-ul",
			levels: [{
				level: 0,
				format: LevelFormat.BULLET,
				text: "•",
				alignment: AlignmentType.LEFT,
				style: { paragraph: { indent: {
					left: 720,
					hanging: 360
				} } }
			}]
		}, {
			reference: "folio-ol",
			levels: [{
				level: 0,
				format: LevelFormat.DECIMAL,
				text: "%1.",
				alignment: AlignmentType.LEFT,
				style: { paragraph: { indent: {
					left: 720,
					hanging: 360
				} } }
			}]
		}] },
		sections: [{
			properties: { page: {
				size,
				margin: {
					top: convertInchesToTwip(f.marginTop),
					bottom: convertInchesToTwip(f.marginBottom),
					left: convertInchesToTwip(f.marginLeft),
					right: convertInchesToTwip(f.marginRight)
				}
			} },
			headers: header ? { default: header } : void 0,
			footers: { default: footer },
			children
		}]
	});
	return Packer.toBlob(doc);
}
function chapterExportBody(chapter) {
	if (chapter.sections.length === 0) return chapter.content;
	return [chapter.content.trim(), chapter.sections.map((s) => `## ${s.title}\n\n${s.content}`.trim()).join("\n\n")].filter(Boolean).join("\n\n");
}
function StudioApp({ bookId }) {
	const load = useStudio((s) => s.load);
	const book = useStudio((s) => s.book);
	const loading = useStudio((s) => s.loading);
	const error = useStudio((s) => s.error);
	const patch = useStudio((s) => s.patch);
	const persist = useStudio((s) => s.persist);
	const select = useStudio((s) => s.select);
	const lastSavedAt = useStudio((s) => s.lastSavedAt);
	const saving = useStudio((s) => s.saving);
	const [mobileTab, setMobileTab] = (0, import_react.useState)("write");
	const [settingsOpen, setSettingsOpen] = (0, import_react.useState)(false);
	const [qualityOpen, setQualityOpen] = (0, import_react.useState)(false);
	const [qualityBusy, setQualityBusy] = (0, import_react.useState)(false);
	const [selectedText, setSelectedText] = (0, import_react.useState)("");
	const [streaming, setStreaming] = (0, import_react.useState)(null);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const abortRef = (0, import_react.useRef)({
		pause: false,
		cancel: false
	});
	(0, import_react.useEffect)(() => {
		load(bookId);
	}, [bookId, load]);
	(0, import_react.useEffect)(() => {
		const t = setInterval(() => {
			persist();
		}, 2e4);
		return () => clearInterval(t);
	}, [persist]);
	const runNode = (0, import_react.useCallback)(async (project, chapterId, sectionId) => {
		const chapter = project.chapters.find((c) => c.id === chapterId);
		if (!chapter) return {
			error: "Chapter missing",
			retryable: false
		};
		const section = sectionId ? chapter.sections.find((s) => s.id === sectionId) : void 0;
		select({
			chapterId,
			sectionId
		});
		setStreaming("");
		let acc = "";
		const result = await generateNode(project, chapter, section, (d) => {
			acc += d;
			setStreaming(acc);
		});
		setStreaming(null);
		return result;
	}, [select]);
	async function generateSelection() {
		const state = useStudio.getState();
		const current = state.book;
		const sel = state.selection;
		if (!current || !sel) return;
		setBusy(true);
		const result = await runNode(current, sel.chapterId, sel.sectionId);
		if ("error" in result) {
			toast.error(result.error);
			setBusy(false);
			return;
		}
		const withText = applyGenerated(current, sel.chapterId, sel.sectionId, result.text, result.usage);
		const ctx = await summarizeChapter(withText, withText.chapters.find((c) => c.id === sel.chapterId));
		patch(() => ({
			...withText,
			context: ctx
		}));
		await persist();
		setBusy(false);
	}
	async function handleAction(action, customCommand) {
		if (action === "generate-section" || action === "generate-chapter") {
			await generateSelection();
			return;
		}
		const state = useStudio.getState();
		const current = state.book;
		const node = state.selectedNode();
		if (!current || !node) return;
		setBusy(true);
		setStreaming("");
		let acc = "";
		const result = await runAiAction(current, node.chapter, action, {
			section: node.section,
			selectedText: selectedText || void 0,
			customCommand,
			onDelta: (d) => {
				acc += d;
				setStreaming(acc);
			}
		});
		setStreaming(null);
		if ("error" in result) {
			toast.error(result.error);
			setBusy(false);
			return;
		}
		if (selectedText && node.section) {
			const next = node.section.content.replace(selectedText, result.text);
			patch((b) => applyGenerated(b, node.chapter.id, node.section?.id, next, result.usage));
		} else if (selectedText && !node.section) {
			const next = node.chapter.content.replace(selectedText, result.text);
			patch((b) => applyGenerated(b, node.chapter.id, void 0, next, result.usage));
		} else patch((b) => applyGenerated(b, node.chapter.id, node.section?.id, result.text, result.usage));
		setBusy(false);
	}
	async function generateEntireBook(resume = false) {
		const start = useStudio.getState().book;
		if (!start) return;
		const nodes = flattenNodes(start.chapters);
		if (nodes.length === 0) {
			toast.error("Add at least one chapter before generating.");
			return;
		}
		abortRef.current = {
			pause: false,
			cancel: false
		};
		const already = resume ? start.generation.completedNodeIds : [];
		patch((b) => ({
			...b,
			generation: {
				status: "running",
				completedNodeIds: already,
				totalNodes: nodes.length,
				message: "Starting…",
				startedAt: b.generation.startedAt ?? Date.now(),
				updatedAt: Date.now()
			}
		}));
		setBusy(true);
		let working = useStudio.getState().book;
		for (const node of nodes) {
			if (abortRef.current.cancel) break;
			while (abortRef.current.pause && !abortRef.current.cancel) await new Promise((r) => setTimeout(r, 200));
			if (abortRef.current.cancel) break;
			if (already.includes(node.nodeId) && resume) continue;
			const chapterLabel = `Chapter ${working.chapters.findIndex((c) => c.id === node.chapter.id) + 1} / ${working.chapters.length}`;
			const sectionLabel = node.section ? `Section ${node.chapter.sections.findIndex((s) => s.id === node.section.id) + 1} / ${node.chapter.sections.length}` : "Full chapter";
			patch((b) => ({
				...b,
				generation: {
					...b.generation,
					status: "running",
					currentChapterId: node.chapter.id,
					currentSectionId: node.section?.id,
					message: `${chapterLabel} · ${sectionLabel}`,
					updatedAt: Date.now()
				}
			}));
			select({
				chapterId: node.chapter.id,
				sectionId: node.section?.id
			});
			const result = await runNode(working, node.chapter.id, node.section?.id);
			if ("error" in result) {
				patch((b) => ({
					...b,
					generation: {
						...b.generation,
						status: "error",
						error: result.error,
						message: "Paused on failure — resume to continue."
					}
				}));
				await persist();
				toast.error(result.error);
				setBusy(false);
				return;
			}
			working = applyGenerated(working, node.chapter.id, node.section?.id, result.text, result.usage);
			const ch = working.chapters.find((c) => c.id === node.chapter.id);
			if (!node.section || node.section.id === ch.sections[ch.sections.length - 1]?.id) working = {
				...working,
				context: await summarizeChapter(working, ch)
			};
			working = {
				...working,
				generation: {
					...working.generation,
					status: "running",
					completedNodeIds: [...working.generation.completedNodeIds, node.nodeId],
					totalNodes: nodes.length,
					updatedAt: Date.now()
				}
			};
			patch(() => working);
			await persist();
		}
		if (abortRef.current.cancel) {
			patch((b) => ({
				...b,
				generation: {
					...b.generation,
					status: "cancelled",
					message: "Cancelled."
				}
			}));
			setBusy(false);
			return;
		}
		const checked = runHeuristicQuality(working);
		working = {
			...working,
			qualityReport: checked,
			generation: {
				...working.generation,
				status: "complete",
				message: "Manuscript complete.",
				completedNodeIds: flattenNodes(working.chapters).map((n) => n.nodeId)
			}
		};
		patch(() => working);
		await persist();
		setBusy(false);
		setQualityOpen(true);
		toast.success("The book is drafted. Review, then export.");
	}
	async function exportDocx() {
		const current = useStudio.getState().book;
		if (!current) return;
		try {
			const blob = await buildDocx(current);
			downloadBlob(blob, `${slug(current.title)}.docx`);
		} catch (e) {
			toast.error(e instanceof Error ? e.message : "Word export failed.");
		}
	}
	function exportMd() {
		const current = useStudio.getState().book;
		if (!current) return;
		const md = bookToMarkdown(current.title, current.subtitle, current.author, current.chapters.map((c) => ({
			title: c.title,
			body: chapterExportBody(c)
		})));
		downloadBlob(new Blob([md], { type: "text/markdown" }), `${slug(current.title)}.md`);
	}
	function exportTxt() {
		const current = useStudio.getState().book;
		if (!current) return;
		const text = current.chapters.map((c) => `${c.title}\n\n${chapterExportBody(c)}`).join("\n\n");
		downloadBlob(new Blob([text], { type: "text/plain" }), `${slug(current.title)}.txt`);
	}
	function exportJson() {
		const current = useStudio.getState().book;
		if (!current) return;
		downloadBlob(new Blob([exportProjectJson(current)], { type: "application/json" }), `${slug(current.title)}.folio.json`);
	}
	async function runQuality(ai = false) {
		const current = useStudio.getState().book;
		if (!current) return;
		const heuristic = runHeuristicQuality(current);
		patch((b) => ({
			...b,
			qualityReport: heuristic
		}));
		setQualityOpen(true);
		if (!ai) return;
		setQualityBusy(true);
		try {
			const prompt = buildQualityPrompt(current, manuscriptDigest(current));
			const req = await toCompleteRequest(current, [{
				role: "system",
				content: prompt.system
			}, {
				role: "user",
				content: prompt.user
			}], 900);
			const result = await streamComplete(req, () => {});
			if (!result.ok) {
				toast.error(result.error);
				return;
			}
			const jsonStart = result.text.indexOf("{");
			const jsonEnd = result.text.lastIndexOf("}");
			if (jsonStart >= 0 && jsonEnd > jsonStart) {
				const parsed = JSON.parse(result.text.slice(jsonStart, jsonEnd + 1));
				patch((b) => ({
					...b,
					usage: addUsage(b.usage, result.usage),
					qualityReport: {
						score: typeof parsed.score === "number" ? parsed.score : heuristic.score,
						createdAt: Date.now(),
						summary: parsed.summary || heuristic.summary,
						issues: [...heuristic.issues, ...(parsed.issues ?? []).map((iss, i) => ({
							id: `ai_${i}`,
							severity: iss.severity || "info",
							title: iss.title || "Issue",
							detail: iss.detail || "",
							category: iss.category || "style"
						}))]
					}
				}));
			}
		} catch {
			toast.error("Could not parse the AI review. Structural score is still available.");
		} finally {
			setQualityBusy(false);
		}
	}
	if (loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-dvh items-center justify-center text-muted-foreground",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 size-4 animate-spin" }), "Opening manuscript…"]
	});
	if (error || !book) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-dvh flex-col items-center justify-center gap-3 px-6 text-center",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "font-display text-2xl",
			children: error || "Manuscript not found"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/",
				children: "Back to library"
			})
		})]
	});
	const gen = book.generation;
	const chapter = book.chapters.find((c) => c.id === gen.currentChapterId);
	const section = chapter?.sections.find((s) => s.id === gen.currentSectionId);
	const rtl = isRtlLanguage(book.language);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("flex h-dvh flex-col bg-background", rtl && "font-persian"),
		dir: rtl ? "rtl" : "ltr",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex h-14 shrink-0 items-center gap-2 border-b border-border px-2 sm:px-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "icon-sm",
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/",
							"aria-label": "Library",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "size-4" })
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0 flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "truncate font-display text-base leading-tight",
							children: book.title
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "truncate text-[11px] text-muted-foreground",
							children: [saving ? "Saving…" : lastSavedAt ? "Saved" : "Local manuscript", ` · ${book.ai.model}`]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						className: "hidden sm:inline-flex",
						disabled: busy,
						onClick: () => void generateEntireBook(gen.status === "paused" || gen.status === "error"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-4" }), gen.status === "paused" || gen.status === "error" ? "Resume book" : "Generate entire book"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "icon-sm",
						variant: "ghost",
						onClick: () => void runQuality(false),
						"aria-label": "Quality",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "size-4" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "icon-sm",
						variant: "ghost",
						onClick: () => setSettingsOpen(true),
						"aria-label": "Settings",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings2, { className: "size-4" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "hidden sm:flex",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "icon-sm",
							variant: "ghost",
							onClick: () => void exportDocx(),
							"aria-label": "Export Word",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-4" })
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex min-h-0 flex-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "hidden min-h-0 flex-1 md:flex",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(qt, {
						orientation: "horizontal",
						className: "h-full flex-1",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Qt, {
								defaultSize: "22%",
								minSize: "16%",
								className: "min-h-0",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StructurePanel, {})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(nn, { className: "w-px bg-border" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Qt, {
								defaultSize: "54%",
								minSize: "34%",
								className: "min-h-0",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EditorPanel, {
									streaming,
									onSelectionChange: setSelectedText
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(nn, { className: "w-px bg-border" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Qt, {
								defaultSize: "24%",
								minSize: "18%",
								className: "min-h-0",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AssistantPanel, {
									busy,
									selectedText,
									onAction: (a) => void handleAction(a),
									onCustom: (c) => void handleAction("custom", c)
								})
							})
						]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex min-h-0 flex-1 flex-col md:hidden",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-h-0 flex-1",
						children: [
							mobileTab === "structure" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StructurePanel, {}) : null,
							mobileTab === "write" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EditorPanel, {
								streaming,
								onSelectionChange: setSelectedText
							}) : null,
							mobileTab === "assist" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AssistantPanel, {
								busy,
								selectedText,
								onAction: (a) => void handleAction(a),
								onCustom: (c) => void handleAction("custom", c)
							}) : null
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
						className: "grid grid-cols-3 border-t border-border bg-card pb-[env(safe-area-inset-bottom)]",
						children: [
							[
								"structure",
								"Structure",
								PanelLeft
							],
							[
								"write",
								"Write",
								FileText
							],
							[
								"assist",
								"Assist",
								Sparkles
							]
						].map(([id, label, Icon]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => setMobileTab(id),
							className: cn("flex h-12 flex-col items-center justify-center text-[11px]", mobileTab === id ? "text-foreground" : "text-muted-foreground"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4" }), label]
						}, id))
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2 border-t border-border px-3 py-2 md:hidden",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						className: "flex-1",
						size: "sm",
						disabled: busy,
						onClick: () => void generateEntireBook(gen.status === "paused" || gen.status === "error"),
						children: "Generate book"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "secondary",
						onClick: () => void exportDocx(),
						children: ".docx"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "ghost",
						onClick: exportMd,
						children: ".md"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "hidden border-t border-border px-3 py-1.5 text-[11px] text-muted-foreground md:flex md:items-center md:gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "hover:text-foreground",
						onClick: exportMd,
						children: "Export Markdown"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "hover:text-foreground",
						onClick: exportTxt,
						children: "Export text"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "hover:text-foreground",
						onClick: exportJson,
						children: "Export project"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "ml-auto tabular-nums",
						children: [
							book.usage.totalTokens.toLocaleString(),
							" tokens · $",
							book.usage.estimatedCostUsd.toFixed(3)
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GenerateOverlay, {
				state: gen,
				chapterLabel: chapter?.title ?? "",
				sectionLabel: section?.title ?? "",
				onPause: () => {
					abortRef.current.pause = true;
					patch((b) => ({
						...b,
						generation: {
							...b.generation,
							status: "paused",
							message: "Paused."
						}
					}));
				},
				onResume: () => {
					abortRef.current.pause = false;
					if (gen.status === "paused" && busy) patch((b) => ({
						...b,
						generation: {
							...b.generation,
							status: "running"
						}
					}));
					else generateEntireBook(true);
				},
				onCancel: () => {
					abortRef.current.cancel = true;
					abortRef.current.pause = false;
					patch((b) => ({
						...b,
						generation: {
							...b.generation,
							status: "cancelled",
							message: "Cancelled."
						}
					}));
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsDialog, {
				open: settingsOpen,
				onOpenChange: setSettingsOpen
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(QualityPanel, {
				open: qualityOpen,
				onOpenChange: setQualityOpen,
				onRunAi: () => void runQuality(true),
				busy: qualityBusy
			})
		]
	});
}
function slug(title) {
	return title.toLowerCase().replace(/[^a-z0-9\u0600-\u06FF]+/g, "-").replace(/^-|-$/g, "") || "book";
}
function StudioRoute() {
	const { bookId } = Route$1.useParams();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StudioApp, { bookId });
}
//#endregion
export { StudioRoute as component };
