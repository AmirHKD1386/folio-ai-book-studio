import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { emptyContext } from "./factory.ts";
import { createChapter } from "./factory.ts";
import { mergeContext, parseStructuredContext, relevantContextFor } from "./context.ts";
import { createBook } from "./factory.ts";

describe("context manager", () => {
  it("parses structured JSON from a model reply", () => {
    const raw = `Here you go
{"summary":"A quiet chapter.","concepts":["attention"],"glossary":[{"term":"tax","definition":"a cost"}],"keyFacts":["doors matter"],"characters":[],"rules":[],"decisions":[],"styleNotes":["short"],"references":[]}
thanks`;
    const parsed = parseStructuredContext(raw, "ch1");
    assert.equal(parsed.chapterSummaries?.[0]?.summary, "A quiet chapter.");
    assert.deepEqual(parsed.concepts, ["attention"]);
    assert.equal(parsed.glossary?.[0]?.term, "tax");
  });

  it("merges glossary and summaries without duplicating a chapter", () => {
    const chapter = createChapter({
      id: "c1",
      title: "One",
      type: "chapter",
      content: "Hello world ".repeat(40),
    });
    const first = mergeContext(emptyContext(), chapter, {
      chapterSummaries: [{ chapterId: "c1", title: "One", summary: "first" }],
      concepts: ["A"],
    });
    const second = mergeContext(first, chapter, {
      chapterSummaries: [{ chapterId: "c1", title: "One", summary: "updated" }],
      concepts: ["A", "B"],
    });
    assert.equal(second.chapterSummaries.length, 1);
    assert.equal(second.chapterSummaries[0].summary, "updated");
    assert.deepEqual(second.concepts, ["A", "B"]);
  });

  it("only includes previous chapter summaries in the prompt pack", () => {
    const c1 = createChapter({ id: "c1", title: "One", type: "chapter" });
    const c2 = createChapter({ id: "c2", title: "Two", type: "chapter" });
    const book = createBook({
      chapters: [c1, c2],
      context: {
        ...emptyContext(),
        chapterSummaries: [
          { chapterId: "c1", title: "One", summary: "secret of one" },
          { chapterId: "c2", title: "Two", summary: "should not leak backward" },
        ],
      },
    });
    const pack = relevantContextFor(book, "c2");
    assert.match(pack, /secret of one/);
    const pack1 = relevantContextFor(book, "c1");
    assert.doesNotMatch(pack1, /should not leak backward/);
  });
});
