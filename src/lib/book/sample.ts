import { createBook, createChapter } from "./factory.ts";
import type { BookProject, Section } from "./types.ts";
import { uid } from "../utils.ts";

function section(title: string, outline: string, content: string, order: number): Section {
  return {
    id: uid("sec"),
    title,
    outline,
    content,
    order,
    status: "generated",
    versions: [],
  };
}

export function createSampleBook(): BookProject {
  const ch1 = createChapter({
    type: "introduction",
    title: "Introduction",
    objective: "Name the problem of fractured attention and the promise of the book.",
    outline: "Why attention is a craft. Who this book is for. How to read it.",
    status: "generated",
    content: `Most of us do not lose our attention in a single dramatic moment. We misplace it in small, polite increments: a glance at a glowing rectangle, a tab opened “just to check,” a conversation split by a vibration in the pocket. By evening the day has happened, but we were only partly present for it.

This book treats attention as a craft — something that can be practiced, repaired, and designed into the rooms where we work and live. It is not a manifesto against technology, and it is not a hymn to nostalgia. It is a practical architecture: how to build conditions in which deep work, deep reading, and deep conversation can occur on purpose.

If you write, study, design, or simply want your hours to belong to you again, you are the reader I had in mind. Read it in order the first time. After that, return to the chapter that matches the leak you are trying to seal.`,
    summary:
      "Introduces attention as a craft rather than a moral failing, and frames the book as a practical architecture for deep work, reading, and conversation.",
  });

  const ch2 = createChapter({
    type: "chapter",
    title: "The Room You Work In",
    objective: "Show how physical and digital rooms either protect or tax attention.",
    outline: "Physical cues, notification design, and the myth of the always-available worker.",
    status: "generated",
    sections: [
      section(
        "Doors, desks, and other honest objects",
        "How furniture and thresholds signal permission to focus.",
        `A door is a piece of social software. Closed, it tells the house that a kind of work is underway. Open, it invites interruption as a default. We underestimate these objects because they do not look like productivity tools. They are older than the spreadsheet and more honest.

Place the work that needs protection in a location with a threshold. If you cannot have a door, invent one: headphones, a lamp that is only on during deep work, a chair that is not the chair you use to drift. The point is not interior design. The point is a cue that you and the people around you can trust.

A clear desk is not a personality. It is a reduced decision load. Every extra object is a tiny fork in the road. Remove the forks that do not belong to the task of the next two hours.`,
        0,
      ),
      section(
        "The notification as a tax",
        "Treat alerts as costs levied against unfinished thought.",
        `A notification is a tax collected in the currency of unfinished thought. You do not merely lose the seconds it takes to read the badge. You lose the reconstruction of the sentence you were forming, the proof you were holding in working memory, the mood of the paragraph.

Design the tax down. Batch the mail. Silence the badges. Make the phone a tool you pick up, not a supervisor that taps your shoulder. If a tool cannot be quiet when you are thinking, it is not a tool for thinking.

This is not austerity. It is accounting. Attention is finite, and every ping is an invoice.`,
        1,
      ),
    ],
  });

  const ch3 = createChapter({
    type: "chapter",
    title: "Reading as Resistance",
    objective: "Rebuild long-form reading as a daily practice.",
    outline: "Paper versus glass, the first twenty minutes, and keeping a commonplace book.",
    status: "generated",
    sections: [
      section(
        "Twenty honest minutes",
        "A minimum viable reading practice.",
        `You do not need a monastery. You need twenty honest minutes. Sit with a book whose sentences are longer than a caption. For the first few days your mind will behave like a dog that has been trained to chase every thrown thing. Let it. Return to the page without commentary.

The first twenty minutes are a warmup, not a verdict on your character. Depth arrives after restlessness, not instead of it. If you wait to feel like a serious reader, you will wait out the decade.

Keep a pencil. Underline sparingly. At the end of the sitting, write one sentence in a notebook: what the author was trying to do. That sentence is a handshake with your future self.`,
        0,
      ),
      section(
        "A commonplace book",
        "Capture without turning reading into filing.",
        `A commonplace book is not a second brain. It is a slow conversation with what you have read. Copy a passage that resists you. Write a question in the margin of your own notebook. Date the entry.

Avoid the trap of capturing everything. Capture is not comprehension. The goal is a small set of pages you will actually reread when you begin a new project. Those pages become a private anthology of pressure — the ideas that still push back.

If you work in Persian, English, or both, keep the original language of the passage. Mixed text is not a problem to be sanitized. It is evidence of a mind that lives in more than one room.`,
        1,
      ),
    ],
  });

  const ch4 = createChapter({
    type: "conclusion",
    title: "Conclusion",
    objective: "Leave the reader with a small architecture they can keep.",
    outline: "Three practices. No heroics.",
    status: "generated",
    content: `You do not need a new personality. You need a room with a threshold, a tax you refuse to pay on demand, and twenty minutes that belong to a book.

Do these three things for a month. Protect one block of work each weekday. Silence the invoices that are not true emergencies. Read with a pencil before you open the infinite feed. The craft will not make you famous. It will make your hours thicker.

Attention is not a mood. It is a place you keep returning to until it begins to feel like home.`,
    summary:
      "Closes with three durable practices: a protected work block, reduced notification tax, and a daily reading sitting.",
  });

  return createBook({
    title: "The Architecture of Attention",
    subtitle: "A field guide for making hours thicker",
    author: "Folio Sample",
    description:
      "A short practical book on designing rooms, tools, and rituals that protect deep work, reading, and conversation.",
    language: "en",
    writingStyle: "conversational",
    customStyleInstructions:
      "Write like a calm essayist. Short paragraphs. No slogans. Concrete objects over abstractions.",
    targetAudience: "Knowledge workers, students, and writers who feel scattered",
    outlineRaw: `# Introduction
# The Room You Work In
## Doors, desks, and other honest objects
## The notification as a tax
# Reading as Resistance
## Twenty honest minutes
## A commonplace book
# Conclusion`,
    chapters: [ch1, ch2, ch3, ch4],
    context: {
      chapterSummaries: [
        {
          chapterId: ch1.id,
          title: ch1.title,
          summary: ch1.summary,
        },
        {
          chapterId: ch2.id,
          title: ch2.title,
          summary:
            "Argues that physical thresholds and notification design either protect or tax attention; treats alerts as invoices against unfinished thought.",
        },
        {
          chapterId: ch3.id,
          title: ch3.title,
          summary:
            "Proposes a twenty-minute reading practice and a spare commonplace book as resistance to caption-length culture.",
        },
        {
          chapterId: ch4.id,
          title: ch4.title,
          summary: ch4.summary,
        },
      ],
      concepts: [
        "attention as craft",
        "notification tax",
        "threshold objects",
        "commonplace book",
      ],
      glossary: [
        {
          term: "notification tax",
          definition: "The hidden cost an alert levies against unfinished thought.",
          firstChapterId: ch2.id,
        },
      ],
      keyFacts: [],
      characters: [],
      rules: ["Do not moralize technology. Design conditions instead."],
      decisions: ["Keep the book short and practical, not academic."],
      styleNotes: ["Short paragraphs", "Concrete objects"],
      references: [],
      userInstructions: [],
    },
  });
}
