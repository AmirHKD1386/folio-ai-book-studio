import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { countGenerationNodes, parseOutline } from "./outline.ts";

describe("parseOutline", () => {
  it("parses markdown chapters and sections", () => {
    const chapters = parseOutline(
      `# Introduction
Hello
# The Craft
## Tools
hammers
## Practice
daily
# Conclusion
bye`,
      { includeIntroduction: true, includeConclusion: true },
    );
    assert.equal(chapters[0].type, "introduction");
    assert.equal(chapters[1].title, "The Craft");
    assert.equal(chapters[1].sections.length, 2);
    assert.equal(chapters[1].sections[0].title, "Tools");
    assert.equal(chapters[1].sections[0].outline, "hammers");
    assert.equal(chapters.at(-1)?.type, "conclusion");
  });

  it("parses numbered outlines", () => {
    const chapters = parseOutline(
      `1. First chapter
1.1 Alpha
1.2 Beta
2. Second chapter`,
      { includeIntroduction: false, includeConclusion: false },
    );
    assert.equal(chapters.length, 2);
    assert.equal(chapters[0].title, "First chapter");
    assert.equal(chapters[0].sections.map((s) => s.title).join(","), "Alpha,Beta");
  });

  it("injects intro and conclusion when requested", () => {
    const chapters = parseOutline("# Only chapter\n", {
      includeIntroduction: true,
      includeConclusion: true,
    });
    assert.equal(chapters[0].type, "introduction");
    assert.equal(chapters[1].title, "Only chapter");
    assert.equal(chapters[2].type, "conclusion");
  });

  it("counts generation nodes by section", () => {
    const chapters = parseOutline(
      `# A
## a1
## a2
# B`,
      { includeIntroduction: false, includeConclusion: false },
    );
    assert.equal(countGenerationNodes(chapters), 3);
  });
});
