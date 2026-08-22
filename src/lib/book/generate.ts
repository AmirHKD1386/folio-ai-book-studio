import type { AiAction, BookProject, Chapter, ChatMessage, Section } from "./types";
import {
  buildActionPrompt,
  buildGenerationPrompt,
  buildSummarizePrompt,
} from "./prompts";
import { chapterBody, mergeContext, parseStructuredContext } from "./context";
import { addUsage, streamComplete } from "@/lib/ai/client";
import { getApiKey } from "./storage";
import { pushVersion } from "./versions";
import type { CompleteRequest } from "@/lib/ai/types";
import { estimateTokens } from "@/lib/utils";

export async function toCompleteRequest(
  book: BookProject,
  messages: ChatMessage[],
  maxTokens?: number,
): Promise<CompleteRequest> {
  const apiKey = book.ai.kind === "xai" ? "" : await getApiKey(book.ai.id);
  return {
    provider: book.ai.kind,
    model: book.ai.model,
    temperature: book.ai.temperature,
    maxTokens: maxTokens ?? book.ai.maxOutputTokens,
    messages,
    baseUrl: book.ai.kind === "xai" ? undefined : book.ai.baseUrl,
    apiKey: apiKey || undefined,
    headers: book.ai.customHeaders,
  };
}

export async function generateNode(
  book: BookProject,
  chapter: Chapter,
  section: Section | undefined,
  onDelta: (text: string) => void,
): Promise<{ text: string; usage: BookProject["usage"] } | { error: string; retryable: boolean }> {
  const prompt = buildGenerationPrompt(book, chapter, section);
  const messages: ChatMessage[] = [
    { role: "system", content: prompt.system },
    { role: "user", content: prompt.user },
  ];
  const req = await toCompleteRequest(book, messages);
  const result = await streamComplete(req, onDelta);
  if (!result.ok) return { error: result.error, retryable: result.retryable };
  return { text: result.text.trim(), usage: addUsage(book.usage, result.usage) };
}

export async function runAiAction(
  book: BookProject,
  chapter: Chapter,
  action: AiAction,
  options: {
    section?: Section;
    selectedText?: string;
    customCommand?: string;
    onDelta: (text: string) => void;
  },
): Promise<{ text: string; usage: BookProject["usage"] } | { error: string; retryable: boolean }> {
  const prompt = buildActionPrompt(book, chapter, action, options);
  const messages: ChatMessage[] = [
    { role: "system", content: prompt.system },
    { role: "user", content: prompt.user },
  ];
  const req = await toCompleteRequest(book, messages);
  const result = await streamComplete(req, options.onDelta);
  if (!result.ok) return { error: result.error, retryable: result.retryable };
  return { text: result.text.trim(), usage: addUsage(book.usage, result.usage) };
}

export async function summarizeChapter(
  book: BookProject,
  chapter: Chapter,
): Promise<BookProject["context"]> {
  const body = chapterBody(chapter);
  if (!body.trim()) return book.context;
  const prompt = buildSummarizePrompt(book, chapter, body);
  const req = await toCompleteRequest(
    book,
    [
      { role: "system", content: prompt.system },
      { role: "user", content: prompt.user },
    ],
    700,
  );
  const result = await streamComplete(req, () => {});
  if (!result.ok) {
    return mergeContext(book.context, { ...chapter, summary: body.slice(0, 400) });
  }
  const structured = parseStructuredContext(result.text, chapter.id);
  return mergeContext(book.context, chapter, structured);
}

export function applyGenerated(
  book: BookProject,
  chapterId: string,
  sectionId: string | undefined,
  text: string,
  usage: BookProject["usage"],
): BookProject {
  return {
    ...book,
    usage,
    chapters: book.chapters.map((ch) => {
      if (ch.id !== chapterId) return ch;
      if (sectionId) {
        const sections = ch.sections.map((s) =>
          s.id === sectionId
            ? {
                ...s,
                content: text,
                status: "generated" as const,
                versions: pushVersion(s.versions, s.content, "generate"),
              }
            : s,
        );
        const allDone = sections.every((s) => s.content.trim());
        return { ...ch, sections, status: allDone ? "generated" : ch.status };
      }
      return {
        ...ch,
        content: text,
        status: "generated" as const,
        versions: pushVersion(ch.versions, ch.content, "generate"),
      };
    }),
  };
}

export function promptSizeWarning(messages: ChatMessage[]): boolean {
  const total = messages.reduce((n, m) => n + estimateTokens(m.content), 0);
  return total > 12000;
}
