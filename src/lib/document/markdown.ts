export type MdBlock =
  | { type: "h1" | "h2" | "h3"; text: string }
  | { type: "p"; text: string }
  | { type: "quote"; text: string }
  | { type: "code"; text: string; lang?: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] };

export function parseMarkdown(src: string): MdBlock[] {
  const lines = src.replace(/\r\n/g, "\n").split("\n");
  const blocks: MdBlock[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) {
      i += 1;
      continue;
    }
    if (line.startsWith("```")) {
      const lang = line.slice(3).trim();
      const buf: string[] = [];
      i += 1;
      while (i < lines.length && !lines[i].startsWith("```")) {
        buf.push(lines[i]);
        i += 1;
      }
      i += 1;
      blocks.push({ type: "code", text: buf.join("\n"), lang });
      continue;
    }
    const h = line.match(/^(#{1,3})\s+(.+)$/);
    if (h) {
      const tag = (`h${h[1].length}` as "h1" | "h2" | "h3");
      blocks.push({ type: tag, text: h[2].trim() });
      i += 1;
      continue;
    }
    if (line.startsWith("> ")) {
      const buf: string[] = [line.replace(/^>\s?/, "")];
      i += 1;
      while (i < lines.length && lines[i].startsWith("> ")) {
        buf.push(lines[i].replace(/^>\s?/, ""));
        i += 1;
      }
      blocks.push({ type: "quote", text: buf.join(" ") });
      continue;
    }
    if (/^\s*[-*•]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*•]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*•]\s+/, ""));
        i += 1;
      }
      blocks.push({ type: "ul", items });
      continue;
    }
    if (/^\s*\d+[.)]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*\d+[.)]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*\d+[.)]\s+/, ""));
        i += 1;
      }
      blocks.push({ type: "ol", items });
      continue;
    }
    const buf: string[] = [line];
    i += 1;
    while (
      i < lines.length &&
      lines[i].trim() &&
      !lines[i].startsWith("#") &&
      !lines[i].startsWith("```") &&
      !lines[i].startsWith("> ") &&
      !/^\s*[-*•]\s+/.test(lines[i]) &&
      !/^\s*\d+[.)]\s+/.test(lines[i])
    ) {
      buf.push(lines[i]);
      i += 1;
    }
    blocks.push({ type: "p", text: buf.join(" ").replace(/\s+/g, " ").trim() });
  }
  return blocks;
}

export function stripMarkdown(src: string): string {
  return src
    .replace(/```[\s\S]*?```/g, "")
    .replace(/^#{1,3}\s+/gm, "")
    .replace(/[*_]/g, "")
    .trim();
}

const PERSIAN_DIGITS = "۰۱۲۳۴۵۶۷۸۹";

export function toPersianDigits(text: string): string {
  return text.replace(/\d/g, (d) => PERSIAN_DIGITS[Number(d)] ?? d);
}

export function bookToMarkdown(title: string, subtitle: string, author: string, chapters: { title: string; body: string }[]): string {
  const parts = [`# ${title}`];
  if (subtitle) parts.push(`*${subtitle}*`);
  if (author) parts.push(`By ${author}`);
  parts.push("");
  for (const ch of chapters) {
    parts.push(`# ${ch.title}`, "", ch.body, "");
  }
  return parts.join("\n");
}
