import { uid } from "../utils.ts";
import { createChapter } from "./factory.ts";
import type { Chapter, ChapterType, Section } from "./types.ts";

const INTRO_RE =
  /^(introduction|intro|preface|foreword|مقدمه|پیشگفتار|المقدمة)$/i;
const CONCLUSION_RE =
  /^(conclusion|epilogue|afterword|نتیجه|نتیجه‌گیری|خاتمه|الخاتمة)$/i;
const APPENDIX_RE = /^(appendix|پیوست|الملحق)/i;
const REFERENCES_RE =
  /^(references|bibliography|منابع|مراجع|المراجع)$/i;

function detectType(title: string): ChapterType {
  const t = title.trim();
  if (INTRO_RE.test(t)) return "introduction";
  if (CONCLUSION_RE.test(t)) return "conclusion";
  if (APPENDIX_RE.test(t)) return "appendix";
  if (REFERENCES_RE.test(t)) return "references";
  return "chapter";
}

function stripChapterPrefix(title: string): string {
  return title
    .replace(
      /^(chapter|chap\.?|بخش|فصل|الجزء|الفصل)\s*[\d۰-۹٠-٩ivxlcdmIVXLCDM]*[:.\-–—)]\s*/i,
      "",
    )
    .replace(/^[\d۰-۹٠-٩]+([.،:])\s*/, "")
    .trim();
}

function headingLevel(line: string): { level: number; title: string } | null {
  const md = line.match(/^(#{1,3})\s+(.+)$/);
  if (md) return { level: md[1].length, title: md[2].trim() };

  const dotted = line.match(/^(\d+(?:\.\d+){1,2})\s+(.+)$/);
  if (dotted) {
    const depth = dotted[1].split(".").length;
    return { level: Math.min(depth, 3), title: dotted[2].trim() };
  }

  const numbered = line.match(/^(\d+)[.)]\s+(.+)$/);
  if (numbered) return { level: 1, title: numbered[2].trim() };

  const persianNum = line.match(/^([۰-۹٠-٩]+(?:[.\.][۰-۹٠-٩]+){0,2})[.)]\s+(.+)$/);
  if (persianNum) {
    const depth = persianNum[1].split(/[.\.]/).length;
    return { level: depth, title: persianNum[2].trim() };
  }

  const dash = line.match(/^(\s*)[-*•]\s+(.+)$/);
  if (dash) {
    const indent = dash[1].replace(/\t/g, "  ").length;
    const level = indent >= 2 ? 2 : 1;
    return { level, title: dash[2].trim() };
  }

  return null;
}

function makeSection(title: string, outline: string, order: number): Section {
  return {
    id: uid("sec"),
    title,
    outline,
    content: "",
    order,
    status: "empty",
    versions: [],
  };
}

export interface ParseOutlineOptions {
  includeIntroduction: boolean;
  includeConclusion: boolean;
}

export function parseOutline(
  raw: string,
  options: ParseOutlineOptions = {
    includeIntroduction: true,
    includeConclusion: true,
  },
): Chapter[] {
  const lines = raw.replace(/\r\n/g, "\n").split("\n");
  const chapters: Chapter[] = [];
  let current: Chapter | null = null;
  let buffer: string[] = [];

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
    } else {
      current.outline = [current.outline, text].filter(Boolean).join("\n");
    }
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
        order: chapters.length,
      });
      chapters.push(current);
      continue;
    }
    if (heading && heading.level >= 2 && current) {
      flushBuffer();
      current.sections.push(
        makeSection(heading.title, "", current.sections.length),
      );
      continue;
    }
    if (!current) {
      current = createChapter({
        title: stripChapterPrefix(line) || line.trim(),
        type: detectType(line),
        order: 0,
      });
      chapters.push(current);
      continue;
    }
    buffer.push(line.trim());
  }
  flushBuffer();

  if (chapters.length === 0) {
    const fallback = raw
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    fallback.forEach((title, i) => {
      chapters.push(
        createChapter({
          title: stripChapterPrefix(title) || title,
          type: detectType(title),
          order: i,
        }),
      );
    });
  }

  let result = chapters.map((ch, i) => ({ ...ch, order: i }));

  const hasIntro = result.some((c) => c.type === "introduction");
  const hasConclusion = result.some((c) => c.type === "conclusion");

  if (options.includeIntroduction && !hasIntro) {
    result = [
      createChapter({
        title: "Introduction",
        type: "introduction",
        objective: "Open the book, state the promise, and orient the reader.",
        order: 0,
      }),
      ...result,
    ];
  }
  if (options.includeConclusion && !hasConclusion) {
    result = [
      ...result,
      createChapter({
        title: "Conclusion",
        type: "conclusion",
        objective: "Synthesize the argument and leave the reader with a clear close.",
        order: result.length,
      }),
    ];
  }

  return result.map((ch, i) => ({ ...ch, order: i }));
}

export function outlineToRaw(chapters: Chapter[]): string {
  const lines: string[] = [];
  for (const ch of chapters) {
    lines.push(`# ${ch.title}`);
    if (ch.objective) lines.push(ch.objective);
    if (ch.outline) lines.push(ch.outline);
    for (const sec of ch.sections) {
      lines.push(`## ${sec.title}`);
      if (sec.outline) lines.push(sec.outline);
    }
    lines.push("");
  }
  return lines.join("\n").trim();
}

export function countGenerationNodes(chapters: Chapter[]): number {
  let n = 0;
  for (const ch of chapters) {
    if (ch.sections.length === 0) n += 1;
    else n += ch.sections.length;
  }
  return n;
}

export function flattenNodes(chapters: Chapter[]): {
  chapter: Chapter;
  section?: Section;
  nodeId: string;
}[] {
  const nodes: { chapter: Chapter; section?: Section; nodeId: string }[] = [];
  for (const chapter of chapters) {
    if (chapter.sections.length === 0) {
      nodes.push({ chapter, nodeId: chapter.id });
    } else {
      for (const section of chapter.sections) {
        nodes.push({ chapter, section, nodeId: section.id });
      }
    }
  }
  return nodes;
}
