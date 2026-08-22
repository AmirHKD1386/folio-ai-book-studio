import {
  AlignmentType,
  convertInchesToTwip,
  Document,
  Footer,
  Header,
  HeadingLevel,
  LevelFormat,
  Packer,
  PageNumber,
  Paragraph,
  TableOfContents,
  TextRun,
} from "docx";
import type { BookProject, Chapter } from "../book/types.ts";
import { chapterBody } from "../book/context.ts";
import { isRtlLanguage } from "../utils.ts";
import { parseMarkdown, toPersianDigits, type MdBlock } from "./markdown.ts";

function pageSize(kind: BookProject["formatting"]["pageSize"]): { width: number; height: number } {
  if (kind === "letter") return { width: 12240, height: 15840 };
  if (kind === "legal") return { width: 12240, height: 20160 };
  return { width: 11906, height: 16838 };
}

function align(value: BookProject["formatting"]["alignment"], rtl: boolean) {
  if (value === "justify") return AlignmentType.BOTH;
  if (value === "right") return AlignmentType.RIGHT;
  return rtl ? AlignmentType.RIGHT : AlignmentType.LEFT;
}

function headingAlign(rtl: boolean) {
  return rtl ? AlignmentType.RIGHT : AlignmentType.LEFT;
}

function runsFromInline(text: string, font: string, sizePt: number, rtl: boolean, persianNumbers: boolean): TextRun[] {
  const prepared = persianNumbers ? toPersianDigits(text) : text;
  const parts = prepared.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g).filter(Boolean);
  if (parts.length === 0) {
    return [
      new TextRun({
        text: prepared,
        font,
        size: sizePt * 2,
        rightToLeft: rtl,
      }),
    ];
  }
  return parts.map((part) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return new TextRun({
        text: part.slice(2, -2),
        font,
        size: sizePt * 2,
        bold: true,
        rightToLeft: rtl,
      });
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return new TextRun({
        text: part.slice(1, -1),
        font,
        size: sizePt * 2,
        italics: true,
        rightToLeft: rtl,
      });
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return new TextRun({
        text: part.slice(1, -1),
        font: "Courier New",
        size: sizePt * 2,
        rightToLeft: false,
      });
    }
    return new TextRun({
      text: part,
      font,
      size: sizePt * 2,
      rightToLeft: rtl,
    });
  });
}

function blocksToParagraphs(
  blocks: MdBlock[],
  book: BookProject,
  rtl: boolean,
): Paragraph[] {
  const f = book.formatting;
  const bodyAlign = align(f.alignment, rtl);
  const paras: Paragraph[] = [];
  for (const block of blocks) {
    if (block.type === "h1" || block.type === "h2" || block.type === "h3") {
      const level =
        block.type === "h1" ? HeadingLevel.HEADING_2 : block.type === "h2" ? HeadingLevel.HEADING_3 : HeadingLevel.HEADING_3;
      const font = block.type === "h1" ? f.heading2Font : f.heading3Font;
      const size = block.type === "h1" ? f.heading2Size : f.heading3Size;
      paras.push(
        new Paragraph({
          heading: level,
          bidirectional: rtl,
          alignment: headingAlign(rtl),
          spacing: { before: f.headingSpacingBefore * 20, after: f.headingSpacingAfter * 20 },
          children: runsFromInline(block.text, font, size, rtl, f.persianNumbers),
        }),
      );
      continue;
    }
    if (block.type === "quote") {
      paras.push(
        new Paragraph({
          bidirectional: rtl,
          alignment: bodyAlign,
          indent: { left: convertInchesToTwip(0.3) },
          spacing: { after: f.paragraphSpacing * 20 },
          children: runsFromInline(block.text, f.bodyFont, f.bodySize, rtl, f.persianNumbers),
        }),
      );
      continue;
    }
    if (block.type === "code") {
      for (const line of (block.text || " ").split("\n")) {
        paras.push(
          new Paragraph({
            alignment: AlignmentType.LEFT,
            spacing: { after: 40, line: 276 },
            children: [
              new TextRun({
                text: line || " ",
                font: "Courier New",
                size: Math.max(18, f.bodySize * 2 - 4),
              }),
            ],
          }),
        );
      }
      continue;
    }
    if (block.type === "ul" || block.type === "ol") {
      block.items.forEach((item, idx) => {
        paras.push(
          new Paragraph({
            bidirectional: rtl,
            alignment: bodyAlign,
            numbering: {
              reference: block.type === "ul" ? "folio-ul" : "folio-ol",
              level: 0,
            },
            spacing: { after: 80 },
            children: runsFromInline(
              block.type === "ol" ? item : item,
              f.bodyFont,
              f.bodySize,
              rtl,
              f.persianNumbers,
            ),
          }),
        );
        void idx;
      });
      continue;
    }
    paras.push(
      new Paragraph({
        bidirectional: rtl,
        alignment: bodyAlign,
        indent: f.firstLineIndent
          ? { firstLine: convertInchesToTwip(f.firstLineIndent) }
          : undefined,
        spacing: {
          after: f.paragraphSpacing * 20,
          line: Math.round(f.lineSpacing * 240),
        },
        children: runsFromInline(block.text, f.bodyFont, f.bodySize, rtl, f.persianNumbers),
      }),
    );
  }
  return paras;
}

function chapterHeading(chapter: Chapter, book: BookProject, rtl: boolean): Paragraph {
  const f = book.formatting;
  const label =
    chapter.type === "chapter"
      ? chapter.title
      : chapter.title;
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    pageBreakBefore: f.chapterPageBreaks,
    bidirectional: rtl,
    alignment: headingAlign(rtl),
    spacing: { before: 240, after: 200 },
    children: runsFromInline(label, f.heading1Font, f.heading1Size, rtl, f.persianNumbers),
  });
}

export async function buildDocx(book: BookProject): Promise<Blob> {
  const rtl = isRtlLanguage(book.language);
  const f = book.formatting;
  const size = pageSize(f.pageSize);
  const children: (Paragraph | TableOfContents)[] = [];

  if (f.coverPage) {
    children.push(
      new Paragraph({ spacing: { before: 1600 } }),
      new Paragraph({
        bidirectional: rtl,
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
        children: [
          new TextRun({
            text: f.persianNumbers ? toPersianDigits(book.title) : book.title,
            font: f.heading1Font,
            size: 56,
            bold: true,
            rightToLeft: rtl,
          }),
        ],
      }),
    );
    if (book.subtitle) {
      children.push(
        new Paragraph({
          bidirectional: rtl,
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
          children: [
            new TextRun({
              text: book.subtitle,
              font: f.bodyFont,
              size: 28,
              italics: true,
              rightToLeft: rtl,
            }),
          ],
        }),
      );
    }
    if (book.author) {
      children.push(
        new Paragraph({
          bidirectional: rtl,
          alignment: AlignmentType.CENTER,
          spacing: { before: 400 },
          children: [
            new TextRun({
              text: book.author,
              font: f.bodyFont,
              size: 24,
              rightToLeft: rtl,
            }),
          ],
        }),
      );
    }
    if (book.description) {
      children.push(
        new Paragraph({
          bidirectional: rtl,
          alignment: AlignmentType.CENTER,
          spacing: { before: 600 },
          indent: { left: convertInchesToTwip(0.8), right: convertInchesToTwip(0.8) },
          children: [
            new TextRun({
              text: book.description,
              font: f.bodyFont,
              size: 22,
              rightToLeft: rtl,
            }),
          ],
        }),
      );
    }
  }

  if (f.tableOfContents) {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        pageBreakBefore: true,
        bidirectional: rtl,
        alignment: headingAlign(rtl),
        children: [
          new TextRun({
            text: rtl && book.language === "fa" ? "فهرست مطالب" : book.language === "ar" ? "جدول المحتويات" : "Contents",
            font: f.heading1Font,
            size: f.heading1Size * 2,
            rightToLeft: rtl,
          }),
        ],
      }),
      new TableOfContents("Contents", {
        hyperlink: true,
        headingStyleRange: "1-3",
      }),
    );
  }

  for (const chapter of book.chapters) {
    children.push(chapterHeading(chapter, book, rtl));
    if (chapter.sections.length === 0) {
      children.push(...blocksToParagraphs(parseMarkdown(chapter.content || ""), book, rtl));
    } else {
      if (chapter.content.trim()) {
        children.push(...blocksToParagraphs(parseMarkdown(chapter.content), book, rtl));
      }
      for (const section of chapter.sections) {
        children.push(
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            bidirectional: rtl,
            alignment: headingAlign(rtl),
            spacing: { before: f.headingSpacingBefore * 20, after: f.headingSpacingAfter * 20 },
            children: runsFromInline(section.title, f.heading2Font, f.heading2Size, rtl, f.persianNumbers),
          }),
        );
        children.push(...blocksToParagraphs(parseMarkdown(section.content || ""), book, rtl));
      }
    }
  }

  if (book.includeReferences && book.references.length) {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        pageBreakBefore: f.chapterPageBreaks,
        bidirectional: rtl,
        alignment: headingAlign(rtl),
        children: [
          new TextRun({
            text: book.language === "fa" ? "منابع" : "References",
            font: f.heading1Font,
            size: f.heading1Size * 2,
            rightToLeft: rtl,
          }),
        ],
      }),
    );
    for (const ref of book.references) {
      const bits = [ref.author, ref.year && `(${ref.year})`, ref.title, ref.url, ref.doi && `DOI: ${ref.doi}`]
        .filter(Boolean)
        .join(". ");
      const note = ref.verified ? bits : `${bits} [verification required]`;
      children.push(
        new Paragraph({
          bidirectional: rtl,
          spacing: { after: 160 },
          children: runsFromInline(note, f.bodyFont, f.bodySize, rtl, f.persianNumbers),
        }),
      );
    }
  }

  const header = f.headerText
    ? new Header({
        children: [
          new Paragraph({
            bidirectional: rtl,
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: f.headerText || book.title,
                font: f.bodyFont,
                size: 18,
                italics: true,
                rightToLeft: rtl,
              }),
            ],
          }),
        ],
      })
    : undefined;

  const footer = new Footer({
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: f.pageNumbers
          ? [
              new TextRun({ text: f.footerText ? `${f.footerText} · ` : "", font: f.bodyFont, size: 18 }),
              new TextRun({ children: [PageNumber.CURRENT], font: f.bodyFont, size: 18 }),
            ]
          : f.footerText
            ? [new TextRun({ text: f.footerText, font: f.bodyFont, size: 18 })]
            : [new TextRun({ text: " ", font: f.bodyFont, size: 18 })],
      }),
    ],
  });

  const doc = new Document({
    title: book.title,
    creator: book.author || "Folio",
    description: book.description,
    features: { updateFields: true },
    styles: {
      default: {
        document: {
          run: {
            font: f.bodyFont,
            rightToLeft: rtl,
          },
          paragraph: {
            alignment: rtl ? AlignmentType.RIGHT : AlignmentType.LEFT,
          },
        },
      },
      paragraphStyles: [
        {
          id: "Heading1",
          name: "Heading 1",
          basedOn: "Normal",
          next: "Normal",
          quickFormat: true,
          paragraph: {
            spacing: { before: 360, after: 200 },
            outlineLevel: 0,
          },
          run: {
            font: f.heading1Font,
            size: f.heading1Size * 2,
            bold: true,
            rightToLeft: rtl,
          },
        },
        {
          id: "Heading2",
          name: "Heading 2",
          basedOn: "Normal",
          next: "Normal",
          quickFormat: true,
          paragraph: {
            spacing: { before: 280, after: 140 },
            outlineLevel: 1,
          },
          run: {
            font: f.heading2Font,
            size: f.heading2Size * 2,
            bold: true,
            rightToLeft: rtl,
          },
        },
        {
          id: "Heading3",
          name: "Heading 3",
          basedOn: "Normal",
          next: "Normal",
          quickFormat: true,
          paragraph: {
            spacing: { before: 200, after: 120 },
            outlineLevel: 2,
          },
          run: {
            font: f.heading3Font,
            size: f.heading3Size * 2,
            bold: true,
            rightToLeft: rtl,
          },
        },
      ],
    },
    numbering: {
      config: [
        {
          reference: "folio-ul",
          levels: [
            {
              level: 0,
              format: LevelFormat.BULLET,
              text: "•",
              alignment: AlignmentType.LEFT,
              style: { paragraph: { indent: { left: 720, hanging: 360 } } },
            },
          ],
        },
        {
          reference: "folio-ol",
          levels: [
            {
              level: 0,
              format: LevelFormat.DECIMAL,
              text: "%1.",
              alignment: AlignmentType.LEFT,
              style: { paragraph: { indent: { left: 720, hanging: 360 } } },
            },
          ],
        },
      ],
    },
    sections: [
      {
        properties: {
          page: {
            size,
            margin: {
              top: convertInchesToTwip(f.marginTop),
              bottom: convertInchesToTwip(f.marginBottom),
              left: convertInchesToTwip(f.marginLeft),
              right: convertInchesToTwip(f.marginRight),
            },
          },
        },
        headers: header ? { default: header } : undefined,
        footers: { default: footer },
        children,
      },
    ],
  });

  return Packer.toBlob(doc);
}

export function chapterExportBody(chapter: Chapter): string {
  if (chapter.sections.length === 0) return chapter.content;
  const intro = chapter.content.trim();
  const secs = chapter.sections.map((s) => `## ${s.title}\n\n${s.content}`.trim()).join("\n\n");
  return [intro, secs].filter(Boolean).join("\n\n");
}

export { chapterBody };
