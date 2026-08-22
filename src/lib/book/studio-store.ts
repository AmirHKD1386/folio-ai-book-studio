import { create } from "zustand";
import { useMemo } from "react";
import type { AiAction, BookProject, Chapter, Section } from "./types";
import { getBook, saveBook } from "./storage";
import { uid } from "@/lib/utils";
import { createChapter } from "./factory";
import { pushVersion } from "./versions";

export type Selection = { chapterId: string; sectionId?: string };

interface StudioState {
  book: BookProject | null;
  selection: Selection | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
  lastSavedAt: number | null;
  load: (id: string) => Promise<void>;
  persist: () => Promise<void>;
  patch: (updater: (book: BookProject) => BookProject, persist?: boolean) => void;
  select: (sel: Selection) => void;
  selectedNode: () => { chapter: Chapter; section?: Section } | null;
  setContent: (content: string, source?: "edit" | "generate" | "ai-action") => void;
  addChapter: () => void;
  addSection: (chapterId: string) => void;
  deleteChapter: (chapterId: string) => void;
  deleteSection: (chapterId: string, sectionId: string) => void;
  renameChapter: (chapterId: string, title: string) => void;
  renameSection: (chapterId: string, sectionId: string, title: string) => void;
  moveChapter: (chapterId: string, dir: -1 | 1) => void;
  moveSection: (chapterId: string, sectionId: string, dir: -1 | 1) => void;
}

let saveTimer: ReturnType<typeof setTimeout> | null = null;

export const useStudio = create<StudioState>((set, get) => ({
  book: null,
  selection: null,
  loading: false,
  saving: false,
  error: null,
  lastSavedAt: null,

  load: async (id) => {
    set({ loading: true, error: null });
    try {
      const book = await getBook(id);
      if (!book) {
        set({ book: null, loading: false, error: "This manuscript could not be found." });
        return;
      }
      const first = book.chapters[0];
      set({
        book,
        loading: false,
        selection: first
          ? { chapterId: first.id, sectionId: first.sections[0]?.id }
          : null,
      });
    } catch (e) {
      set({
        loading: false,
        error: e instanceof Error ? e.message : "Could not open the manuscript.",
      });
    }
  },

  persist: async () => {
    const book = get().book;
    if (!book) return;
    set({ saving: true });
    try {
      await saveBook(book);
      set({ saving: false, lastSavedAt: Date.now() });
    } catch (e) {
      set({
        saving: false,
        error: e instanceof Error ? e.message : "Autosave failed.",
      });
    }
  },

  patch: (updater, persist = true) => {
    const current = get().book;
    if (!current) return;
    const next = updater(current);
    set({ book: next });
    if (!persist) return;
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      void get().persist();
    }, 700);
  },

  select: (sel) => set({ selection: sel }),

  selectedNode: () => {
    const { book, selection } = get();
    if (!book || !selection) return null;
    const chapter = book.chapters.find((c) => c.id === selection.chapterId);
    if (!chapter) return null;
    const section = selection.sectionId
      ? chapter.sections.find((s) => s.id === selection.sectionId)
      : undefined;
    return { chapter, section };
  },

  setContent: (content, source = "edit") => {
    const { selection } = get();
    if (!selection) return;
    get().patch((book) => ({
      ...book,
      chapters: book.chapters.map((ch) => {
        if (ch.id !== selection.chapterId) return ch;
        if (selection.sectionId) {
          return {
            ...ch,
            sections: ch.sections.map((s) =>
              s.id === selection.sectionId
                ? {
                    ...s,
                    content,
                    status: source === "edit" ? "edited" : "generated",
                    versions:
                      source === "edit"
                        ? s.versions
                        : pushVersion(s.versions, s.content, source),
                  }
                : s,
            ),
          };
        }
        return {
          ...ch,
          content,
          status: source === "edit" ? "edited" : "generated",
          versions:
            source === "edit" ? ch.versions : pushVersion(ch.versions, ch.content, source),
        };
      }),
    }));
  },

  addChapter: () => {
    get().patch((book) => {
      const ch = createChapter({
        title: `Chapter ${book.chapters.length + 1}`,
        type: "chapter",
        order: book.chapters.length,
      });
      return { ...book, chapters: [...book.chapters, ch] };
    });
  },

  addSection: (chapterId) => {
    const id = uid("sec");
    get().patch((book) => ({
      ...book,
      chapters: book.chapters.map((ch) =>
        ch.id === chapterId
          ? {
              ...ch,
              sections: [
                ...ch.sections,
                {
                  id,
                  title: `Section ${ch.sections.length + 1}`,
                  outline: "",
                  content: "",
                  order: ch.sections.length,
                  status: "empty" as const,
                  versions: [],
                },
              ],
            }
          : ch,
      ),
    }));
    get().select({ chapterId, sectionId: id });
  },

  deleteChapter: (chapterId) => {
    get().patch((book) => {
      const chapters = book.chapters.filter((c) => c.id !== chapterId).map((c, i) => ({ ...c, order: i }));
      return { ...book, chapters };
    });
    const book = get().book;
    if (book?.chapters[0]) {
      get().select({
        chapterId: book.chapters[0].id,
        sectionId: book.chapters[0].sections[0]?.id,
      });
    }
  },

  deleteSection: (chapterId, sectionId) => {
    get().patch((book) => ({
      ...book,
      chapters: book.chapters.map((ch) =>
        ch.id === chapterId
          ? {
              ...ch,
              sections: ch.sections.filter((s) => s.id !== sectionId).map((s, i) => ({ ...s, order: i })),
            }
          : ch,
      ),
    }));
  },

  renameChapter: (chapterId, title) => {
    get().patch((book) => ({
      ...book,
      chapters: book.chapters.map((ch) => (ch.id === chapterId ? { ...ch, title } : ch)),
    }));
  },

  renameSection: (chapterId, sectionId, title) => {
    get().patch((book) => ({
      ...book,
      chapters: book.chapters.map((ch) =>
        ch.id === chapterId
          ? {
              ...ch,
              sections: ch.sections.map((s) => (s.id === sectionId ? { ...s, title } : s)),
            }
          : ch,
      ),
    }));
  },

  moveChapter: (chapterId, dir) => {
    get().patch((book) => {
      const idx = book.chapters.findIndex((c) => c.id === chapterId);
      const next = idx + dir;
      if (idx < 0 || next < 0 || next >= book.chapters.length) return book;
      const chapters = [...book.chapters];
      const [item] = chapters.splice(idx, 1);
      chapters.splice(next, 0, item);
      return { ...book, chapters: chapters.map((c, i) => ({ ...c, order: i })) };
    });
  },

  moveSection: (chapterId, sectionId, dir) => {
    get().patch((book) => ({
      ...book,
      chapters: book.chapters.map((ch) => {
        if (ch.id !== chapterId) return ch;
        const idx = ch.sections.findIndex((s) => s.id === sectionId);
        const next = idx + dir;
        if (idx < 0 || next < 0 || next >= ch.sections.length) return ch;
        const sections = [...ch.sections];
        const [item] = sections.splice(idx, 1);
        sections.splice(next, 0, item);
        return { ...ch, sections: sections.map((s, i) => ({ ...s, order: i })) };
      }),
    }));
  },
}));

export function useSelectedNode() {
  const book = useStudio((s) => s.book);
  const selection = useStudio((s) => s.selection);
  return useMemo(() => {
    if (!book || !selection) return null;
    const chapter = book.chapters.find((c) => c.id === selection.chapterId);
    if (!chapter) return null;
    const section = selection.sectionId
      ? chapter.sections.find((s) => s.id === selection.sectionId)
      : undefined;
    return { chapter, section };
  }, [book, selection]);
}
