import { uid, wordCount } from "../utils.ts";
import { chapterBody } from "./context.ts";
import type { BookProject, QualityIssue, QualityReport } from "./types.ts";

function ngrams(text: string, n: number): Map<string, number> {
  const words = text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter(Boolean);
  const map = new Map<string, number>();
  for (let i = 0; i <= words.length - n; i++) {
    const g = words.slice(i, i + n).join(" ");
    map.set(g, (map.get(g) ?? 0) + 1);
  }
  return map;
}

export function runHeuristicQuality(book: BookProject): QualityReport {
  const issues: QualityIssue[] = [];

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
        category: "completeness",
      });
      continue;
    }
    if (words < 120) {
      issues.push({
        id: uid("iss"),
        severity: "warning",
        chapterId: ch.id,
        title: `${ch.title} is very short`,
        detail: `Only ${words} words. A full chapter usually needs more development.`,
        category: "completeness",
      });
    }
    for (const sec of ch.sections) {
      if (!sec.content.trim()) {
        issues.push({
          id: uid("iss"),
          severity: "error",
          chapterId: ch.id,
          sectionId: sec.id,
          title: `Missing section: ${sec.title}`,
          detail: `Section “${sec.title}” in ${ch.title} is empty.`,
          category: "completeness",
        });
      } else if (wordCount(sec.content) < 60) {
        issues.push({
          id: uid("iss"),
          severity: "warning",
          chapterId: ch.id,
          sectionId: sec.id,
          title: `Thin section: ${sec.title}`,
          detail: `“${sec.title}” is only ${wordCount(sec.content)} words.`,
          category: "structure",
        });
      }
    }
    const grams = ngrams(body, 8);
    const repeats = [...grams.entries()].filter(([, n]) => n >= 3).slice(0, 3);
    for (const [phrase] of repeats) {
      issues.push({
        id: uid("iss"),
        severity: "warning",
        chapterId: ch.id,
        title: `Repeated phrasing in ${ch.title}`,
        detail: `The phrase “${phrase}” appears several times.`,
        category: "repetition",
      });
    }
    if (body.includes("[verification required]")) {
      issues.push({
        id: uid("iss"),
        severity: "info",
        chapterId: ch.id,
        title: `Unverified claims in ${ch.title}`,
        detail: "This chapter marks claims that still need a source.",
        category: "references",
      });
    }
  }

  const bodies = book.chapters.map((ch) => ({ ch, body: chapterBody(ch) }));
  for (let i = 0; i < bodies.length; i++) {
    for (let j = i + 1; j < bodies.length; j++) {
      const a = ngrams(bodies[i].body, 10);
      let shared = 0;
      let sample = "";
      for (const [g, n] of ngrams(bodies[j].body, 10)) {
        if ((a.get(g) ?? 0) > 0 && n > 0) {
          shared += 1;
          if (!sample) sample = g;
        }
      }
      if (shared >= 4) {
        issues.push({
          id: uid("iss"),
          severity: "warning",
          chapterId: bodies[j].ch.id,
          title: "Possible repeated passage",
          detail: `${bodies[i].ch.title} and ${bodies[j].ch.title} share similar wording (e.g. “${sample}”).`,
          category: "repetition",
        });
      }
    }
  }

  for (const term of book.context.glossary) {
    const needle = term.term;
    if (needle.length < 4) continue;
    const variant = needle.toLowerCase();
    let hits = 0;
    for (const { body } of bodies) {
      if (body.toLowerCase().includes(variant)) hits += 1;
    }
    if (hits === 0 && bodies.some((b) => b.body.trim())) {
      issues.push({
        id: uid("iss"),
        severity: "info",
        title: `Unused glossary term: ${needle}`,
        detail: "This term is in the book glossary but does not appear in the manuscript.",
        category: "terminology",
      });
    }
  }

  if (book.includeIntroduction && !book.chapters.some((c) => c.type === "introduction")) {
    issues.push({
      id: uid("iss"),
      severity: "warning",
      title: "Introduction missing",
      detail: "The project is set to include an introduction, but none exists.",
      category: "structure",
    });
  }
  if (book.includeConclusion && !book.chapters.some((c) => c.type === "conclusion")) {
    issues.push({
      id: uid("iss"),
      severity: "warning",
      title: "Conclusion missing",
      detail: "The project is set to include a conclusion, but none exists.",
      category: "structure",
    });
  }

  const errors = issues.filter((i) => i.severity === "error").length;
  const warnings = issues.filter((i) => i.severity === "warning").length;
  const score = Math.max(0, Math.min(100, 100 - errors * 12 - warnings * 4));
  const summary =
    issues.length === 0
      ? "No structural issues found. Review the prose once more before export."
      : `Found ${errors} blocking issue${errors === 1 ? "" : "s"} and ${warnings} warning${warnings === 1 ? "" : "s"}.`;

  return {
    score,
    createdAt: Date.now(),
    issues,
    summary,
  };
}

export function manuscriptDigest(book: BookProject, limit = 9000): string {
  const parts: string[] = [
    `Title: ${book.title}`,
    `Description: ${book.description}`,
    `Style: ${book.writingStyle}`,
    `Audience: ${book.targetAudience}`,
  ];
  for (const ch of book.chapters) {
    const body = chapterBody(ch);
    parts.push(`\n# ${ch.title}\n${body.slice(0, 900)}`);
  }
  return parts.join("\n").slice(0, limit);
}
