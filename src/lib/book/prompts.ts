import type { AiAction, BookProject, Chapter, Section } from "./types";
import { WRITING_STYLES } from "./types";
import { relevantContextFor } from "./context";
import {
  CHAPTER_GENERATION,
  CONSISTENCY_CHECK,
  CUSTOM_COMMAND,
  EXPANSION,
  QUALITY_CONTROL,
  REWRITE,
  SECTION_GENERATION,
  SUMMARIZATION,
  TRANSFORM,
} from "./prompt-templates";

export function renderTemplate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => vars[key] ?? "");
}

export function styleLabel(book: BookProject): string {
  const found = WRITING_STYLES.find((s) => s.id === book.writingStyle);
  return found?.label ?? book.writingStyle;
}

export function languageName(book: BookProject): string {
  if (book.language === "other") return book.customLanguage || "the specified language";
  const map: Record<string, string> = {
    en: "English",
    fa: "Persian (Farsi)",
    ar: "Arabic",
    de: "German",
    fr: "French",
    es: "Spanish",
  };
  return map[book.language] ?? "English";
}

function baseVars(book: BookProject, chapter: Chapter, section?: Section): Record<string, string> {
  const sectionOutline =
    section?.outline ||
    chapter.sections.map((s) => `- ${s.title}${s.outline ? `: ${s.outline}` : ""}`).join("\n");
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
    constraints:
      "Do not invent citations, DOIs, quotations, or sources. If a claim needs a source, mark it as [verification required]. Keep terminology consistent with the glossary. Do not recap the entire book. Write only the requested content.",
    userInstructions: book.context.userInstructions.join("\n"),
    existingContent: section ? section.content : chapter.content,
  };
}

export function getTemplate(book: BookProject, name: string, fallback: string): string {
  return book.promptOverrides[name] || fallback;
}

export function buildSystemPrompt(book: BookProject): string {
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

export function buildGenerationPrompt(
  book: BookProject,
  chapter: Chapter,
  section?: Section,
): { system: string; user: string } {
  const vars = baseVars(book, chapter, section);
  const template = section
    ? getTemplate(book, "section_generation", SECTION_GENERATION)
    : getTemplate(book, "chapter_generation", CHAPTER_GENERATION);
  return { system: buildSystemPrompt(book), user: renderTemplate(template, vars) };
}

export function buildActionPrompt(
  book: BookProject,
  chapter: Chapter,
  action: AiAction,
  options: {
    section?: Section;
    selectedText?: string;
    customCommand?: string;
  } = {},
): { system: string; user: string } {
  const vars: Record<string, string> = {
    ...baseVars(book, chapter, options.section),
    selectedText: options.selectedText || options.section?.content || chapter.content,
    customCommand: options.customCommand ?? "",
  };
  let template = TRANSFORM;
  if (action === "expand") template = getTemplate(book, "expansion", EXPANSION);
  else if (action === "rewrite" || action === "regenerate")
    template = getTemplate(book, "rewrite", REWRITE);
  else if (action === "custom") template = getTemplate(book, "custom", CUSTOM_COMMAND);
  else template = getTemplate(book, "transform", TRANSFORM);

  const actionLabel: Record<string, string> = {
    expand: "Expand the text while preserving meaning. Add depth, examples, and transitions.",
    shorten: "Make the text more concise without losing essential meaning.",
    rewrite: "Rewrite the text, preserving meaning, improving flow and voice.",
    regenerate: "Write a fresh version of this content from the outline, replacing the current draft.",
    improve: "Improve clarity, structure, grammar, and readability. Keep the meaning.",
    continue: "Continue writing from the end of the current text in the same voice.",
    simplify: "Explain the same ideas in simpler language for a less expert reader.",
    custom: options.customCommand || "Follow the user's instruction.",
  };
  vars.action = actionLabel[action] ?? action;

  return { system: buildSystemPrompt(book), user: renderTemplate(template, vars) };
}

export function buildSummarizePrompt(
  book: BookProject,
  chapter: Chapter,
  body: string,
): { system: string; user: string } {
  const vars = {
    ...baseVars(book, chapter),
    existingContent: body.slice(0, 8000),
  };
  return {
    system: buildSystemPrompt(book),
    user: renderTemplate(getTemplate(book, "summarization", SUMMARIZATION), vars),
  };
}

export function buildQualityPrompt(book: BookProject, digest: string): { system: string; user: string } {
  return {
    system: buildSystemPrompt(book),
    user: renderTemplate(getTemplate(book, "quality_control", QUALITY_CONTROL), {
      title: book.title,
      digest,
    }),
  };
}

export function buildConsistencyPrompt(
  book: BookProject,
  digest: string,
): { system: string; user: string } {
  return {
    system: buildSystemPrompt(book),
    user: renderTemplate(getTemplate(book, "consistency_check", CONSISTENCY_CHECK), {
      title: book.title,
      digest,
    }),
  };
}

export const PROMPT_CATALOG: { id: string; label: string; body: string }[] = [
  { id: "chapter_generation", label: "Chapter generation", body: CHAPTER_GENERATION },
  { id: "section_generation", label: "Section generation", body: SECTION_GENERATION },
  { id: "rewrite", label: "Rewrite", body: REWRITE },
  { id: "expansion", label: "Expand", body: EXPANSION },
  { id: "transform", label: "Transform", body: TRANSFORM },
  { id: "summarization", label: "Summarization", body: SUMMARIZATION },
  { id: "quality_control", label: "Quality control", body: QUALITY_CONTROL },
  { id: "consistency_check", label: "Consistency check", body: CONSISTENCY_CHECK },
  { id: "custom", label: "Custom command", body: CUSTOM_COMMAND },
];
