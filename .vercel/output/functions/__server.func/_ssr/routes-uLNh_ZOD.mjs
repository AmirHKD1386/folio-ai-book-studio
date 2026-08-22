import { i as __toESM } from "../_runtime.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { _ as Link, v as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { _ as saveBook, h as parseImportedProject, i as createChapter, m as listBooks, r as createBook, s as deleteBook, t as Button, u as formatDate, v as uid } from "./factory-WeNc_gGQ.mjs";
import { A as BookOpen, S as FileDown, d as Plus, i as Trash2 } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-uLNh_ZOD.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function section(title, outline, content, order) {
	return {
		id: uid("sec"),
		title,
		outline,
		content,
		order,
		status: "generated",
		versions: []
	};
}
function createSampleBook() {
	const ch1 = createChapter({
		type: "introduction",
		title: "Introduction",
		objective: "Name the problem of fractured attention and the promise of the book.",
		outline: "Why attention is a craft. Who this book is for. How to read it.",
		status: "generated",
		content: `Most of us do not lose our attention in a single dramatic moment. We misplace it in small, polite increments: a glance at a glowing rectangle, a tab opened “just to check,” a conversation split by a vibration in the pocket. By evening the day has happened, but we were only partly present for it.

This book treats attention as a craft — something that can be practiced, repaired, and designed into the rooms where we work and live. It is not a manifesto against technology, and it is not a hymn to nostalgia. It is a practical architecture: how to build conditions in which deep work, deep reading, and deep conversation can occur on purpose.

If you write, study, design, or simply want your hours to belong to you again, you are the reader I had in mind. Read it in order the first time. After that, return to the chapter that matches the leak you are trying to seal.`,
		summary: "Introduces attention as a craft rather than a moral failing, and frames the book as a practical architecture for deep work, reading, and conversation."
	});
	const ch2 = createChapter({
		type: "chapter",
		title: "The Room You Work In",
		objective: "Show how physical and digital rooms either protect or tax attention.",
		outline: "Physical cues, notification design, and the myth of the always-available worker.",
		status: "generated",
		sections: [section("Doors, desks, and other honest objects", "How furniture and thresholds signal permission to focus.", `A door is a piece of social software. Closed, it tells the house that a kind of work is underway. Open, it invites interruption as a default. We underestimate these objects because they do not look like productivity tools. They are older than the spreadsheet and more honest.

Place the work that needs protection in a location with a threshold. If you cannot have a door, invent one: headphones, a lamp that is only on during deep work, a chair that is not the chair you use to drift. The point is not interior design. The point is a cue that you and the people around you can trust.

A clear desk is not a personality. It is a reduced decision load. Every extra object is a tiny fork in the road. Remove the forks that do not belong to the task of the next two hours.`, 0), section("The notification as a tax", "Treat alerts as costs levied against unfinished thought.", `A notification is a tax collected in the currency of unfinished thought. You do not merely lose the seconds it takes to read the badge. You lose the reconstruction of the sentence you were forming, the proof you were holding in working memory, the mood of the paragraph.

Design the tax down. Batch the mail. Silence the badges. Make the phone a tool you pick up, not a supervisor that taps your shoulder. If a tool cannot be quiet when you are thinking, it is not a tool for thinking.

This is not austerity. It is accounting. Attention is finite, and every ping is an invoice.`, 1)]
	});
	const ch3 = createChapter({
		type: "chapter",
		title: "Reading as Resistance",
		objective: "Rebuild long-form reading as a daily practice.",
		outline: "Paper versus glass, the first twenty minutes, and keeping a commonplace book.",
		status: "generated",
		sections: [section("Twenty honest minutes", "A minimum viable reading practice.", `You do not need a monastery. You need twenty honest minutes. Sit with a book whose sentences are longer than a caption. For the first few days your mind will behave like a dog that has been trained to chase every thrown thing. Let it. Return to the page without commentary.

The first twenty minutes are a warmup, not a verdict on your character. Depth arrives after restlessness, not instead of it. If you wait to feel like a serious reader, you will wait out the decade.

Keep a pencil. Underline sparingly. At the end of the sitting, write one sentence in a notebook: what the author was trying to do. That sentence is a handshake with your future self.`, 0), section("A commonplace book", "Capture without turning reading into filing.", `A commonplace book is not a second brain. It is a slow conversation with what you have read. Copy a passage that resists you. Write a question in the margin of your own notebook. Date the entry.

Avoid the trap of capturing everything. Capture is not comprehension. The goal is a small set of pages you will actually reread when you begin a new project. Those pages become a private anthology of pressure — the ideas that still push back.

If you work in Persian, English, or both, keep the original language of the passage. Mixed text is not a problem to be sanitized. It is evidence of a mind that lives in more than one room.`, 1)]
	});
	const ch4 = createChapter({
		type: "conclusion",
		title: "Conclusion",
		objective: "Leave the reader with a small architecture they can keep.",
		outline: "Three practices. No heroics.",
		status: "generated",
		content: `You do not need a new personality. You need a room with a threshold, a tax you refuse to pay on demand, and twenty minutes that belong to a book.

Do these three things for a month. Protect one block of work each weekday. Silence the invoices that are not true emergencies. Read with a pencil before you open the infinite feed. The craft will not make you famous. It will make your hours thicker.

Attention is not a mood. It is a place you keep returning to until it begins to feel like home.`,
		summary: "Closes with three durable practices: a protected work block, reduced notification tax, and a daily reading sitting."
	});
	return createBook({
		title: "The Architecture of Attention",
		subtitle: "A field guide for making hours thicker",
		author: "Folio Sample",
		description: "A short practical book on designing rooms, tools, and rituals that protect deep work, reading, and conversation.",
		language: "en",
		writingStyle: "conversational",
		customStyleInstructions: "Write like a calm essayist. Short paragraphs. No slogans. Concrete objects over abstractions.",
		targetAudience: "Knowledge workers, students, and writers who feel scattered",
		outlineRaw: `# Introduction
# The Room You Work In
## Doors, desks, and other honest objects
## The notification as a tax
# Reading as Resistance
## Twenty honest minutes
## A commonplace book
# Conclusion`,
		chapters: [
			ch1,
			ch2,
			ch3,
			ch4
		],
		context: {
			chapterSummaries: [
				{
					chapterId: ch1.id,
					title: ch1.title,
					summary: ch1.summary
				},
				{
					chapterId: ch2.id,
					title: ch2.title,
					summary: "Argues that physical thresholds and notification design either protect or tax attention; treats alerts as invoices against unfinished thought."
				},
				{
					chapterId: ch3.id,
					title: ch3.title,
					summary: "Proposes a twenty-minute reading practice and a spare commonplace book as resistance to caption-length culture."
				},
				{
					chapterId: ch4.id,
					title: ch4.title,
					summary: ch4.summary
				}
			],
			concepts: [
				"attention as craft",
				"notification tax",
				"threshold objects",
				"commonplace book"
			],
			glossary: [{
				term: "notification tax",
				definition: "The hidden cost an alert levies against unfinished thought.",
				firstChapterId: ch2.id
			}],
			keyFacts: [],
			characters: [],
			rules: ["Do not moralize technology. Design conditions instead."],
			decisions: ["Keep the book short and practical, not academic."],
			styleNotes: ["Short paragraphs", "Concrete objects"],
			references: [],
			userInstructions: []
		}
	});
}
function LibraryPage() {
	const navigate = useNavigate();
	const [books, setBooks] = (0, import_react.useState)(null);
	async function refresh() {
		const items = await listBooks();
		setBooks(items);
	}
	(0, import_react.useEffect)(() => {
		refresh();
	}, []);
	async function openSample() {
		const sample = createSampleBook();
		await saveBook(sample);
		toast.success("Opened the sample manuscript.");
		await navigate({
			to: "/studio/$bookId",
			params: { bookId: sample.id }
		});
	}
	async function remove(id) {
		await deleteBook(id);
		await refresh();
	}
	async function onImport(file) {
		try {
			const raw = await file.text();
			const project = parseImportedProject(raw);
			await saveBook(project);
			toast.success("Manuscript imported.");
			await navigate({
				to: "/studio/$bookId",
				params: { bookId: project.id }
			});
		} catch (e) {
			toast.error(e instanceof Error ? e.message : "Could not import that file.");
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-dvh bg-background",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-display text-lg",
					children: "F"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-display text-xl leading-none tracking-tight",
					children: "Folio"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-xs text-muted-foreground",
					children: "AI Book Studio"
				})] })]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "inline-flex",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "file",
						accept: "application/json,.json",
						className: "sr-only",
						onChange: (e) => {
							const file = e.target.files?.[0];
							if (file) onImport(file);
							e.target.value = "";
						}
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "inline-flex h-10 items-center gap-2 rounded-md border border-border px-3 text-sm text-muted-foreground hover:bg-accent",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileDown, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "hidden sm:inline",
							children: "Import"
						})]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/new",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), "New book"]
					})
				})]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
			className: "mx-auto max-w-6xl px-5 pb-16",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "folio-enter max-w-2xl py-6 sm:py-10",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
					className: "font-display text-4xl tracking-tight text-foreground sm:text-5xl",
					children: ["Give it an outline.", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "block text-muted-foreground",
						children: "Take home a book."
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 max-w-xl text-base text-muted-foreground",
					children: "Commission a manuscript, write it chapter by chapter with Grok, keep a living glossary, then export a properly styled Word document — including Persian and RTL."
				})]
			}), books === null ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
				children: [
					0,
					1,
					2
				].map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-48 animate-pulse rounded-xl bg-card" }, i))
			}) : books.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, { onSample: () => void openSample() }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
				className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
				children: [books.map((book) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
					className: "group relative flex h-full flex-col rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/40",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/studio/$bookId",
						params: { bookId: book.id },
						className: "flex flex-1 flex-col",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs uppercase tracking-[0.16em] text-muted-foreground",
								children: [book.language === "fa" ? "فارسی" : book.language.toUpperCase(), book.generationStatus === "paused" ? " · Resume" : ""]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "mt-3 font-display text-2xl leading-tight tracking-tight",
								children: book.title
							}),
							book.subtitle ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-sm text-muted-foreground",
								children: book.subtitle
							}) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-auto pt-6 text-xs text-muted-foreground",
								children: [
									book.chapterCount,
									" chapters · ",
									book.wordCount.toLocaleString(),
									" words",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "block mt-1",
										children: formatDate(book.updatedAt)
									})
								]
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "absolute right-3 top-3 rounded-md p-2 text-muted-foreground opacity-100 sm:opacity-0 sm:group-hover:opacity-100 hover:bg-accent hover:text-foreground",
						"aria-label": `Delete ${book.title}`,
						onClick: () => void remove(book.id),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
					})]
				}) }, book.id)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => void openSample(),
					className: "flex h-full min-h-48 w-full flex-col items-start justify-between rounded-xl border border-dashed border-border p-5 text-left hover:border-primary/40 hover:bg-card",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookOpen, { className: "size-5 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-xl",
						children: "Sample manuscript"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted-foreground",
						children: "Open a finished short book and export it."
					})] })]
				}) })]
			})]
		})]
	});
}
function EmptyState({ onSample }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-xl border border-border bg-card p-8 sm:p-12",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-display text-3xl tracking-tight",
				children: "The shelf is empty."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 max-w-md text-muted-foreground",
				children: "Start a new book from a title and outline, or open the sample to see the editor, quality check, and Word export."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-8 flex flex-wrap gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/new",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), "Commission a book"]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "secondary",
					onClick: onSample,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookOpen, { className: "size-4" }), "Open sample"]
				})]
			})
		]
	});
}
var SplitComponent = LibraryPage;
//#endregion
export { SplitComponent as component };
