import { wordCount } from "../utils.ts";
import type { BookContext, BookProject, Chapter, GlossaryEntry } from "./types.ts";

const MAX_SUMMARY_CHARS = 900;
const MAX_PREVIOUS_SUMMARIES = 8;
const MAX_GLOSSARY = 40;
const MAX_CONCEPTS = 24;

export function localChapterSummary(chapter: Chapter): string {
  const parts: string[] = [];
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

export function chapterBody(chapter: Chapter): string {
  if (chapter.sections.length === 0) return chapter.content ?? "";
  return chapter.sections
    .map((s) => `## ${s.title}\n\n${s.content}`.trim())
    .join("\n\n");
}

export function extractTerms(text: string): string[] {
  const matches = text.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+\b/g) ?? [];
  const counts = new Map<string, number>();
  for (const m of matches) {
    counts.set(m, (counts.get(m) ?? 0) + 1);
  }
  return [...counts.entries()]
    .filter(([, n]) => n >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([term]) => term);
}

export function mergeContext(
  current: BookContext,
  chapter: Chapter,
  structured?: Partial<BookContext>,
): BookContext {
  const summary = structured?.chapterSummaries?.[0]?.summary || localChapterSummary(chapter);
  const summaries = [
    ...current.chapterSummaries.filter((s) => s.chapterId !== chapter.id),
    { chapterId: chapter.id, title: chapter.title, summary },
  ].slice(-16);

  const glossaryMap = new Map<string, GlossaryEntry>();
  for (const g of current.glossary) glossaryMap.set(g.term.toLowerCase(), g);
  for (const g of structured?.glossary ?? []) {
    glossaryMap.set(g.term.toLowerCase(), { ...g, firstChapterId: g.firstChapterId || chapter.id });
  }

  const uniq = (arr: string[], extra: string[] = []) =>
    [...new Set([...arr, ...extra].map((s) => s.trim()).filter(Boolean))];

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
    userInstructions: uniq(current.userInstructions, structured?.userInstructions).slice(0, 12),
  };
}

function mergeCharacters(
  a: BookContext["characters"],
  b: BookContext["characters"],
): BookContext["characters"] {
  const map = new Map<string, { name: string; description: string }>();
  for (const c of [...a, ...b]) {
    const key = c.name.toLowerCase();
    const prev = map.get(key);
    map.set(key, {
      name: c.name,
      description: c.description || prev?.description || "",
    });
  }
  return [...map.values()].slice(0, 24);
}

export function relevantContextFor(
  book: BookProject,
  chapterId: string,
): string {
  const ctx = book.context;
  const idx = book.chapters.findIndex((c) => c.id === chapterId);
  const previous = ctx.chapterSummaries
    .filter((s) => {
      const i = book.chapters.findIndex((c) => c.id === s.chapterId);
      return i >= 0 && i < idx;
    })
    .slice(-MAX_PREVIOUS_SUMMARIES);

  const blocks: string[] = [];
  if (previous.length) {
    blocks.push(
      "Previous chapter summaries:\n" +
        previous.map((s) => `- ${s.title}: ${s.summary}`).join("\n"),
    );
  }
  if (ctx.concepts.length) {
    blocks.push("Important concepts: " + ctx.concepts.join("; "));
  }
  if (ctx.glossary.length) {
    blocks.push(
      "Terminology:\n" +
        ctx.glossary
          .slice(0, 20)
          .map((g) => `- ${g.term}: ${g.definition}`)
          .join("\n"),
    );
  }
  if (ctx.keyFacts.length) {
    blocks.push("Key facts: " + ctx.keyFacts.slice(0, 12).join("; "));
  }
  if (ctx.characters.length) {
    blocks.push(
      "Characters:\n" +
        ctx.characters.map((c) => `- ${c.name}: ${c.description}`).join("\n"),
    );
  }
  if (ctx.rules.length) {
    blocks.push("Rules / assumptions: " + ctx.rules.join("; "));
  }
  if (ctx.decisions.length) {
    blocks.push("Important decisions: " + ctx.decisions.join("; "));
  }
  if (ctx.styleNotes.length) {
    blocks.push("Style notes: " + ctx.styleNotes.join("; "));
  }
  if (book.customStyleInstructions) {
    blocks.push("Custom writing instructions: " + book.customStyleInstructions);
  }
  if (ctx.userInstructions.length) {
    blocks.push("User instructions: " + ctx.userInstructions.join("; "));
  }
  return blocks.join("\n\n").slice(0, 6000);
}

export function parseStructuredContext(raw: string, chapterId: string): Partial<BookContext> {
  try {
    const jsonStart = raw.indexOf("{");
    const jsonEnd = raw.lastIndexOf("}");
    if (jsonStart < 0 || jsonEnd <= jsonStart) return {};
    const data = JSON.parse(raw.slice(jsonStart, jsonEnd + 1)) as Record<string, unknown>;
    const strArr = (v: unknown) =>
      Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
    const glossary: GlossaryEntry[] = Array.isArray(data.glossary)
      ? data.glossary
          .map((g) => {
            if (!g || typeof g !== "object") return null;
            const rec = g as Record<string, unknown>;
            if (typeof rec.term !== "string") return null;
            return {
              term: rec.term,
              definition: typeof rec.definition === "string" ? rec.definition : "",
              firstChapterId: chapterId,
            };
          })
          .filter((g): g is GlossaryEntry => Boolean(g))
      : [];
    const characters = Array.isArray(data.characters)
      ? data.characters
          .map((c) => {
            if (!c || typeof c !== "object") return null;
            const rec = c as Record<string, unknown>;
            if (typeof rec.name !== "string") return null;
            return {
              name: rec.name,
              description: typeof rec.description === "string" ? rec.description : "",
            };
          })
          .filter((c): c is { name: string; description: string } => Boolean(c))
      : [];
    const summary = typeof data.summary === "string" ? data.summary : "";
    return {
      chapterSummaries: summary
        ? [{ chapterId, title: "", summary }]
        : [],
      concepts: strArr(data.concepts),
      glossary,
      keyFacts: strArr(data.keyFacts),
      characters,
      rules: strArr(data.rules),
      decisions: strArr(data.decisions),
      styleNotes: strArr(data.styleNotes),
      references: strArr(data.references),
    };
  } catch {
    return {};
  }
}
