import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createBook, createChapter } from "./factory.ts";
import { runHeuristicQuality } from "./quality.ts";

describe("quality heuristics", () => {
  it("flags empty chapters and scores below 100", () => {
    const book = createBook({
      includeIntroduction: false,
      includeConclusion: false,
      chapters: [
        createChapter({ title: "Empty", type: "chapter", content: "" }),
        createChapter({
          title: "Full",
          type: "chapter",
          content: "A complete paragraph with enough words to pass the short-chapter heuristic for this test case of quality control in Folio studio.",
        }),
      ],
    });
    const report = runHeuristicQuality(book);
    assert.ok(report.score < 100);
    assert.ok(report.issues.some((i) => i.category === "completeness"));
  });

  it("scores a filled sample-like book highly", () => {
    const bodies = [
      "A door is a piece of social software that tells the house a kind of work is underway. Place the work that needs protection behind a threshold you and others can trust. Remove extra objects so the next two hours have fewer forks in the road. A lamp that is only on during deep work can stand in for a door. The point is not interior design. The point is a cue. Every extra object is a tiny decision. Clear the desk for the task, not as a personality. Furniture is older than the spreadsheet and more honest about permission. Closed means a kind of work is happening. Open invites interruption as the default. Invent a threshold if you cannot have a room. Headphones can be a door. A chair that is not the drifting chair can be a door. Trust the cue.",
      "A notification is a tax collected in unfinished thought. You lose the sentence you were forming, not merely the seconds of the badge. Batch the mail and make the phone a tool you pick up rather than a supervisor. If a tool cannot be quiet when you are thinking, it is not a tool for thinking. This is accounting, not austerity. Attention is finite and every ping is an invoice. Reconstruction of a proof in working memory costs more than the glance. Silence the badges. Design the tax down. The always-available worker is a myth that leaks hours. Protect the unfinished thought as if it were a physical object on the desk. It is.",
      "You do not need a monastery. You need twenty honest minutes with sentences longer than a caption. Depth arrives after restlessness. Keep a pencil and write one sentence for your future self. The first sitting is a warmup, not a verdict on character. If you wait to feel like a serious reader you will wait out the decade. Underline sparingly. A commonplace book is a slow conversation, not a second brain. Capture is not comprehension. Keep the original language of a passage, even when Persian and English share a page. Mixed text is evidence of a mind that lives in more than one room. Return tomorrow.",
    ];
    const book = createBook({
      includeIntroduction: true,
      includeConclusion: true,
      chapters: [
        createChapter({ title: "Introduction", type: "introduction", content: bodies[0] }),
        createChapter({ title: "Middle", type: "chapter", content: bodies[1] }),
        createChapter({ title: "Conclusion", type: "conclusion", content: bodies[2] }),
      ],
    });
    const report = runHeuristicQuality(book);
    assert.ok(report.score >= 90);
    assert.equal(report.issues.filter((i) => i.severity === "error").length, 0);
  });
});
