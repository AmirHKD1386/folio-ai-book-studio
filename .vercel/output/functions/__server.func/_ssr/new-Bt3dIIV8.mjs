import { i as __toESM } from "../_runtime.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { _ as Link, v as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { _ as saveBook, a as defaultAiConfig, g as saveApiKey, n as cn, o as defaultFormatting, r as createBook, t as Button } from "./factory-WeNc_gGQ.mjs";
import { a as Slider, c as WRITING_STYLES, d as getAiStatus, f as parseOutline, i as LANGUAGES, n as Field, o as Switch, r as Input, s as Textarea, t as FONT_CHOICES } from "./types-vTjikMWc.mjs";
import { M as ArrowLeft, j as ArrowRight, k as Check } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/new-Bt3dIIV8.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var STEPS = [
	{
		id: "brief",
		label: "Brief"
	},
	{
		id: "outline",
		label: "Outline"
	},
	{
		id: "voice",
		label: "Voice"
	},
	{
		id: "engine",
		label: "Engine"
	},
	{
		id: "press",
		label: "Press"
	}
];
var SAMPLE_OUTLINE = `# Introduction
Why this book exists and who it is for.

# Chapter 1: First principles
## The core idea
## A working example

# Chapter 2: Practice
## Daily habits
## Common mistakes

# Conclusion
What to do on Monday morning.`;
function CreateWizard() {
	const navigate = useNavigate();
	const [step, setStep] = (0, import_react.useState)(0);
	const [title, setTitle] = (0, import_react.useState)("");
	const [subtitle, setSubtitle] = (0, import_react.useState)("");
	const [author, setAuthor] = (0, import_react.useState)("");
	const [description, setDescription] = (0, import_react.useState)("");
	const [outline, setOutline] = (0, import_react.useState)(SAMPLE_OUTLINE);
	const [includeIntro, setIncludeIntro] = (0, import_react.useState)(true);
	const [includeConclusion, setIncludeConclusion] = (0, import_react.useState)(true);
	const [style, setStyle] = (0, import_react.useState)("educational");
	const [styleNotes, setStyleNotes] = (0, import_react.useState)("");
	const [audience, setAudience] = (0, import_react.useState)("Curious general readers");
	const [language, setLanguage] = (0, import_react.useState)("en");
	const [customLanguage, setCustomLanguage] = (0, import_react.useState)("");
	const [provider, setProvider] = (0, import_react.useState)("xai");
	const [model, setModel] = (0, import_react.useState)("grok-4.5");
	const [baseUrl, setBaseUrl] = (0, import_react.useState)("https://api.openai.com/v1");
	const [apiKey, setApiKey] = (0, import_react.useState)("");
	const [temperature, setTemperature] = (0, import_react.useState)(.7);
	const [maxTokens, setMaxTokens] = (0, import_react.useState)(2500);
	const [bodyFont, setBodyFont] = (0, import_react.useState)("Georgia");
	const [headingFont, setHeadingFont] = (0, import_react.useState)("Georgia");
	const [pageSize, setPageSize] = (0, import_react.useState)("a4");
	const [cover, setCover] = (0, import_react.useState)(true);
	const [toc, setToc] = (0, import_react.useState)(true);
	const [pageNumbers, setPageNumbers] = (0, import_react.useState)(true);
	const [persianNumbers, setPersianNumbers] = (0, import_react.useState)(false);
	const [xaiOn, setXaiOn] = (0, import_react.useState)(null);
	const [busy, setBusy] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		getAiStatus().then((s) => setXaiOn(s.xaiAvailable));
	}, []);
	(0, import_react.useEffect)(() => {
		if (language === "fa") {
			setBodyFont("Tahoma");
			setHeadingFont("Tahoma");
			setPersianNumbers(true);
		}
	}, [language]);
	const parsed = (0, import_react.useMemo)(() => parseOutline(outline, {
		includeIntroduction: includeIntro,
		includeConclusion
	}), [
		outline,
		includeIntro,
		includeConclusion
	]);
	const canNext = step === 0 ? title.trim().length > 0 && description.trim().length > 0 : step === 1 ? parsed.length > 0 : true;
	async function create() {
		setBusy(true);
		try {
			const formatting = defaultFormatting(language);
			formatting.bodyFont = bodyFont;
			formatting.heading1Font = headingFont;
			formatting.heading2Font = headingFont;
			formatting.heading3Font = headingFont;
			formatting.pageSize = pageSize;
			formatting.coverPage = cover;
			formatting.tableOfContents = toc;
			formatting.pageNumbers = pageNumbers;
			formatting.persianNumbers = persianNumbers;
			formatting.headerText = title;
			const ai = defaultAiConfig();
			ai.kind = provider;
			ai.model = model;
			ai.temperature = temperature;
			ai.maxOutputTokens = maxTokens;
			if (provider !== "xai") {
				ai.id = "custom";
				ai.name = provider === "local" ? "Local model" : "Custom API";
				ai.baseUrl = baseUrl;
			}
			const book = createBook({
				title: title.trim(),
				subtitle: subtitle.trim(),
				author: author.trim(),
				description: description.trim(),
				language,
				customLanguage: customLanguage.trim() || void 0,
				writingStyle: style,
				customStyleInstructions: styleNotes.trim(),
				targetAudience: audience.trim() || "General readers",
				outlineRaw: outline,
				includeIntroduction: includeIntro,
				includeConclusion,
				formatting,
				ai,
				chapters: parsed
			});
			if (provider !== "xai" && apiKey) await saveApiKey(book.ai.id, apiKey);
			await saveBook(book);
			await navigate({
				to: "/studio/$bookId",
				params: { bookId: book.id }
			});
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-dvh bg-background",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					asChild: true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "size-4" }), "Library"]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-display text-lg",
					children: "New manuscript"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "w-24" })
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto grid max-w-5xl gap-8 px-5 pb-20 lg:grid-cols-[220px_1fr]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
				className: "hidden lg:flex flex-col gap-1 pt-4",
				children: STEPS.map((s, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => setStep(i),
					className: cn("flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm", i === step ? "bg-card text-foreground" : "text-muted-foreground hover:text-foreground"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: cn("flex size-6 items-center justify-center rounded-full text-xs", i < step ? "bg-primary text-primary-foreground" : i === step ? "bg-secondary" : "bg-secondary/50"),
						children: i < step ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-3" }) : i + 1
					}), s.label]
				}) }, s.id))
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-xl border border-border bg-card p-5 sm:p-8",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mb-6 flex gap-2 lg:hidden",
						children: STEPS.map((s, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("h-1 flex-1 rounded-full", i <= step ? "bg-primary" : "bg-secondary") }, s.id))
					}),
					step === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col gap-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
								className: "font-display text-3xl tracking-tight",
								children: "The brief"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Title",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: title,
									onChange: (e) => setTitle(e.target.value),
									placeholder: "The Architecture of Attention"
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Subtitle",
								hint: "optional",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: subtitle,
									onChange: (e) => setSubtitle(e.target.value)
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Author",
								hint: "optional",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: author,
									onChange: (e) => setAuthor(e.target.value)
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Description",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
									rows: 5,
									value: description,
									onChange: (e) => setDescription(e.target.value),
									placeholder: "What is this book, who is it for, and what should the reader be able to do after the last page?"
								})
							})
						]
					}),
					step === 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col gap-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
								className: "font-display text-3xl tracking-tight",
								children: "The outline"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted-foreground",
								children: "Use Markdown headings, numbered chapters, or a nested list. Folio will parse chapters and sections."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
								rows: 16,
								value: outline,
								onChange: (e) => setOutline(e.target.value),
								className: "font-mono text-xs sm:text-sm"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "text-sm text-muted-foreground",
								children: ["Import a .txt or .md file", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "file",
									accept: ".txt,.md,text/plain,text/markdown",
									className: "mt-2 block text-sm",
									onChange: async (e) => {
										const file = e.target.files?.[0];
										if (!file) return;
										setOutline(await file.text());
									}
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap gap-6",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "flex items-center gap-2 text-sm",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
										checked: includeIntro,
										onCheckedChange: setIncludeIntro
									}), "Introduction"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "flex items-center gap-2 text-sm",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
										checked: includeConclusion,
										onCheckedChange: setIncludeConclusion
									}), "Conclusion"]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-sm text-muted-foreground",
								children: [
									"Parsed ",
									parsed.length,
									" chapter",
									parsed.length === 1 ? "" : "s",
									",",
									" ",
									parsed.reduce((n, c) => n + c.sections.length, 0),
									" sections."
								]
							})
						]
					}),
					step === 2 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col gap-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
								className: "font-display text-3xl tracking-tight",
								children: "The voice"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Language",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "grid grid-cols-2 gap-2 sm:grid-cols-4",
									children: LANGUAGES.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => setLanguage(l.id),
										className: cn("rounded-lg border px-3 py-2 text-sm", language === l.id ? "border-primary bg-secondary" : "border-border hover:bg-accent"),
										children: l.native
									}, l.id))
								})
							}),
							language === "other" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Language name",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: customLanguage,
									onChange: (e) => setCustomLanguage(e.target.value)
								})
							}) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Writing style",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "grid gap-2 sm:grid-cols-2",
									children: WRITING_STYLES.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										onClick: () => setStyle(s.id),
										className: cn("rounded-lg border px-3 py-3 text-left", style === s.id ? "border-primary bg-secondary" : "border-border hover:bg-accent"),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "block text-sm font-medium",
											children: s.label
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "mt-1 block text-xs text-muted-foreground",
											children: s.hint
										})]
									}, s.id))
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Custom writing instructions",
								hint: "kept for every chapter",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
									rows: 4,
									value: styleNotes,
									onChange: (e) => setStyleNotes(e.target.value),
									placeholder: "Write like an experienced professor who explains difficult ideas to beginners."
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Target audience",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: audience,
									onChange: (e) => setAudience(e.target.value)
								})
							})
						]
					}),
					step === 3 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col gap-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
								className: "font-display text-3xl tracking-tight",
								children: "The engine"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted-foreground",
								children: "Grok is included when available. You can also connect any OpenAI-compatible API or a local server. Keys are stored only on this device, never inside the manuscript file."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "grid gap-2 sm:grid-cols-3",
								children: [
									[
										"xai",
										"Grok (xAI)",
										xaiOn === false ? "Unavailable here" : "Included"
									],
									[
										"openai-compatible",
										"OpenAI-compatible",
										"Your key"
									],
									[
										"local",
										"Local LLM",
										"Ollama & others"
									]
								].map(([id, label, hint]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: () => {
										setProvider(id);
										if (id === "xai") setModel("grok-4.5");
										if (id === "local") {
											setBaseUrl("http://127.0.0.1:11434/v1");
											setModel("llama3.1");
										}
									},
									className: cn("rounded-lg border px-3 py-3 text-left", provider === id ? "border-primary bg-secondary" : "border-border hover:bg-accent"),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "block text-sm font-medium",
										children: label
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "mt-1 block text-xs text-muted-foreground",
										children: hint
									})]
								}, id))
							}),
							provider !== "xai" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Base URL",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: baseUrl,
									onChange: (e) => setBaseUrl(e.target.value)
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "API key",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									type: "password",
									autoComplete: "off",
									value: apiKey,
									onChange: (e) => setApiKey(e.target.value)
								})
							})] }) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Model",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: model,
									onChange: (e) => setModel(e.target.value)
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: `Temperature ${temperature.toFixed(1)}`,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
									min: 0,
									max: 1.2,
									step: .1,
									value: [temperature],
									onValueChange: (v) => setTemperature(v[0] ?? .7)
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: `Max output tokens ${maxTokens}`,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
									min: 400,
									max: 8e3,
									step: 100,
									value: [maxTokens],
									onValueChange: (v) => setMaxTokens(v[0] ?? 2500)
								})
							})
						]
					}),
					step === 4 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col gap-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
								className: "font-display text-3xl tracking-tight",
								children: "The press"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted-foreground",
								children: "These become real Word styles — Heading 1–3, body, headers, and a table of contents."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid gap-4 sm:grid-cols-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Body font",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
											className: "h-10 rounded-md border border-input bg-background px-3 text-sm",
											value: bodyFont,
											onChange: (e) => setBodyFont(e.target.value),
											children: FONT_CHOICES.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: f }, f))
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Heading font",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
											className: "h-10 rounded-md border border-input bg-background px-3 text-sm",
											value: headingFont,
											onChange: (e) => setHeadingFont(e.target.value),
											children: FONT_CHOICES.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: f }, f))
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Page size",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
											className: "h-10 rounded-md border border-input bg-background px-3 text-sm",
											value: pageSize,
											onChange: (e) => setPageSize(e.target.value),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "a4",
												children: "A4"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "letter",
												children: "US Letter"
											})]
										})
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-col gap-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "flex items-center justify-between gap-3 text-sm",
										children: ["Cover page ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
											checked: cover,
											onCheckedChange: setCover
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "flex items-center justify-between gap-3 text-sm",
										children: ["Table of contents ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
											checked: toc,
											onCheckedChange: setToc
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "flex items-center justify-between gap-3 text-sm",
										children: ["Page numbers ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
											checked: pageNumbers,
											onCheckedChange: setPageNumbers
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "flex items-center justify-between gap-3 text-sm",
										children: ["Persian digits ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
											checked: persianNumbers,
											onCheckedChange: setPersianNumbers
										})]
									})
								]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-8 flex items-center justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "ghost",
							disabled: step === 0,
							onClick: () => setStep((s) => s - 1),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "size-4" }), "Back"]
						}), step < STEPS.length - 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							disabled: !canNext,
							onClick: () => setStep((s) => s + 1),
							children: ["Continue", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-4" })]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							disabled: busy || !title.trim(),
							onClick: () => void create(),
							children: busy ? "Creating…" : "Open studio"
						})]
					})
				]
			})]
		})]
	});
}
var SplitComponent = CreateWizard;
//#endregion
export { SplitComponent as component };
