import { uid } from "../utils.ts";
import type {
  AIProviderConfig,
  BookContext,
  BookProject,
  Chapter,
  DocumentFormatting,
  GenerationState,
  TokenUsage,
} from "./types.ts";

export function defaultFormatting(language: string): DocumentFormatting {
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
    firstLineIndent: rtl ? 0 : 0.3,
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
    persianNumbers: language === "fa",
  };
}

export function defaultAiConfig(): AIProviderConfig {
  return {
    id: "xai",
    kind: "xai",
    name: "Grok (xAI)",
    baseUrl: "https://api.x.ai/v1",
    model: "grok-4.5",
    temperature: 0.7,
    maxOutputTokens: 2500,
    systemPrompt: "",
    customHeaders: {},
  };
}

export function emptyContext(): BookContext {
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
    userInstructions: [],
  };
}

export function emptyUsage(): TokenUsage {
  return {
    inputTokens: 0,
    outputTokens: 0,
    totalTokens: 0,
    estimatedCostUsd: 0,
    calls: 0,
  };
}

export function idleGeneration(): GenerationState {
  return {
    status: "idle",
    completedNodeIds: [],
    totalNodes: 0,
    message: "",
  };
}

export function createChapter(
  partial: Partial<Chapter> & Pick<Chapter, "title" | "type">,
): Chapter {
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
    versions: partial.versions ?? [],
  };
}

export function createBook(partial: Partial<BookProject> = {}): BookProject {
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
    updatedAt: partial.updatedAt ?? now,
  };
}
