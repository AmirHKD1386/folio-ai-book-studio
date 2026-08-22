import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createSampleBook } from "../book/sample.ts";
import { createBook, createChapter, defaultFormatting } from "../book/factory.ts";
import { buildDocx } from "./docx.ts";

describe("DOCX export", () => {
  it("builds a real Word document from the sample book", async () => {
    const blob = await buildDocx(createSampleBook());
    const buf = Buffer.from(await blob.arrayBuffer());
    assert.ok(buf.length > 1000);
    assert.equal(buf.subarray(0, 2).toString(), "PK");
  });

  it("builds an RTL Persian document", async () => {
    const book = createBook({
      title: "معماری توجه",
      language: "fa",
      formatting: defaultFormatting("fa"),
      chapters: [
        createChapter({
          title: "مقدمه",
          type: "introduction",
          content: "این یک بند فارسی است with a Latin word داخل متن.",
        }),
      ],
    });
    const blob = await buildDocx(book);
    const buf = Buffer.from(await blob.arrayBuffer());
    assert.equal(buf.subarray(0, 2).toString(), "PK");
  });
});
