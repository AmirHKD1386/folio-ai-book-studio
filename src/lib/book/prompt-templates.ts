export const CHAPTER_GENERATION = `Write the full chapter below as publishable book prose in Markdown.

Book title: {{title}}
Book description: {{description}}
Target audience: {{audience}}
Writing style: {{style}}
{{styleInstructions}}
Language: {{language}}

Chapter title: {{chapterTitle}}
Chapter objective: {{chapterObjective}}
Chapter outline:
{{chapterOutline}}

{{context}}

Constraints:
{{constraints}}

{{userInstructions}}

Write the chapter now. Do not include the book title or a "Chapter X" label unless it belongs in the prose. Start with the chapter's opening paragraph or a ## heading for the first section.`;

export const SECTION_GENERATION = `Write the following section as publishable book prose in Markdown.

Book title: {{title}}
Book description: {{description}}
Target audience: {{audience}}
Writing style: {{style}}
{{styleInstructions}}
Language: {{language}}

Chapter: {{chapterTitle}}
Chapter objective: {{chapterObjective}}
Section title: {{sectionTitle}}
Section / chapter outline:
{{sectionOutline}}

{{context}}

Constraints:
{{constraints}}

{{userInstructions}}

Write only this section. Do not repeat the chapter title as a heading. You may use ### subheadings if the section is long.`;

export const REWRITE = `Rewrite the following book passage.

Instruction: {{action}}
Book: {{title}}
Chapter: {{chapterTitle}}
Section: {{sectionTitle}}
Style: {{style}}
Language: {{language}}
{{styleInstructions}}

{{context}}

Passage:
"""
{{selectedText}}
"""

Return only the rewritten passage in Markdown.`;

export const EXPANSION = `Expand the following book passage while preserving its meaning. Add explanation, examples, and smoother transitions. Do not contradict established context.

Book: {{title}}
Chapter: {{chapterTitle}}
Style: {{style}}
Language: {{language}}

{{context}}

Passage:
"""
{{selectedText}}
"""

Return only the expanded passage in Markdown.`;

export const TRANSFORM = `Transform the following book passage.

Instruction: {{action}}
Book: {{title}}
Chapter: {{chapterTitle}}
Section: {{sectionTitle}}
Style: {{style}}
Language: {{language}}
{{styleInstructions}}

{{context}}

Passage:
"""
{{selectedText}}
"""

Return only the resulting passage in Markdown.`;

export const CUSTOM_COMMAND = `Apply this instruction to the book passage:

{{customCommand}}

Book: {{title}}
Chapter: {{chapterTitle}}
Section: {{sectionTitle}}
Style: {{style}}
Language: {{language}}

{{context}}

Passage:
"""
{{selectedText}}
"""

Return only the resulting passage in Markdown.`;

export const SUMMARIZATION = `Extract a compact context record for later chapters of this book. Return ONLY valid JSON with this shape:
{
  "summary": "120-180 word chapter summary",
  "concepts": ["..."],
  "glossary": [{"term": "...", "definition": "..."}],
  "keyFacts": ["..."],
  "characters": [{"name": "...", "description": "..."}],
  "rules": ["..."],
  "decisions": ["..."],
  "styleNotes": ["..."],
  "references": ["only sources actually named in the chapter, never invented"]
}

Book: {{title}}
Chapter: {{chapterTitle}}

Chapter text:
"""
{{existingContent}}
"""`;

export const QUALITY_CONTROL = `You are the final editor of the book "{{title}}". Review the digest of the manuscript and return ONLY JSON:
{
  "score": 0-100,
  "summary": "one paragraph",
  "issues": [
    {"severity": "info"|"warning"|"error", "title": "...", "detail": "...", "category": "repetition|terminology|structure|logic|references|transition|completeness|style", "chapter": "optional title"}
  ]
}

Do not invent problems. Be specific.

Manuscript digest:
{{digest}}`;

export const CONSISTENCY_CHECK = `Check the book "{{title}}" for consistency of terminology, character facts, timeline, and claims. Return ONLY JSON:
{
  "issues": [
    {"severity": "info"|"warning"|"error", "title": "...", "detail": "...", "category": "terminology|contradiction|character|timeline|style"}
  ]
}

Digest:
{{digest}}`;
