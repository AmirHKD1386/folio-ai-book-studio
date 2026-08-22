import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createBook, createChapter } from "./factory.ts";
import { exportProjectJson, parseImportedProject, toListItem } from "./storage.ts";

describe("project save/load shape", () => {
  it("round-trips a project through JSON without an API key field", () => {
    const book = createBook({
      title: "Test",
      chapters: [createChapter({ title: "One", type: "chapter", content: "Hello" })],
    });
    const raw = exportProjectJson(book);
    assert.doesNotMatch(raw, /apiKey/);
    const loaded = parseImportedProject(raw);
    assert.equal(loaded.title, "Test");
    assert.equal(loaded.chapters[0].content, "Hello");
  });

  it("rejects garbage imports", () => {
    assert.throws(() => parseImportedProject("{}"), /not a Folio project/);
  });

  it("summarizes a book for the library", () => {
    const book = createBook({
      title: "Shelf",
      chapters: [
        createChapter({
          title: "A",
          type: "chapter",
          content: "one two three",
        }),
      ],
    });
    const item = toListItem(book);
    assert.equal(item.title, "Shelf");
    assert.equal(item.chapterCount, 1);
    assert.equal(item.wordCount, 3);
  });
});
