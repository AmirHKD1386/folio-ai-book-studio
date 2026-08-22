import type { ReactNode } from "react";
import { ChevronDown, ChevronRight, GripVertical, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useStudio } from "@/lib/book/studio-store";
import { cn, wordCount } from "@/lib/utils";
import type { Chapter } from "@/lib/book/types";

export function StructurePanel() {
  const book = useStudio((s) => s.book);
  const selection = useStudio((s) => s.selection);
  const select = useStudio((s) => s.select);
  const addChapter = useStudio((s) => s.addChapter);
  const addSection = useStudio((s) => s.addSection);
  const deleteChapter = useStudio((s) => s.deleteChapter);
  const deleteSection = useStudio((s) => s.deleteSection);
  const renameChapter = useStudio((s) => s.renameChapter);
  const renameSection = useStudio((s) => s.renameSection);
  const moveChapter = useStudio((s) => s.moveChapter);
  const moveSection = useStudio((s) => s.moveSection);
  const [open, setOpen] = useState<Record<string, boolean>>({});

  if (!book) return null;

  return (
    <div className="flex h-full flex-col bg-card">
      <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-3">
        <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Structure</p>
        <Button size="icon-sm" variant="ghost" onClick={addChapter} aria-label="Add chapter">
          <Plus className="size-4" />
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <ul className="p-2">
          {book.chapters.map((ch, idx) => {
            const expanded = open[ch.id] ?? true;
            const selected = selection?.chapterId === ch.id && !selection.sectionId;
            return (
              <li key={ch.id} className="mb-1">
                <div
                  className={cn(
                    "group flex items-center gap-1 rounded-md px-1 py-1",
                    selected && "bg-secondary",
                  )}
                >
                  <button
                    type="button"
                    className="size-7 shrink-0 text-muted-foreground"
                    onClick={() => setOpen((o) => ({ ...o, [ch.id]: !expanded }))}
                    aria-label={expanded ? "Collapse" : "Expand"}
                  >
                    {ch.sections.length ? (
                      expanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />
                    ) : (
                      <GripVertical className="size-3.5 opacity-40" />
                    )}
                  </button>
                  <button
                    type="button"
                    className="min-w-0 flex-1 truncate text-left text-sm"
                    onClick={() => select({ chapterId: ch.id })}
                    onDoubleClick={() => {
                      const next = window.prompt("Chapter title", ch.title);
                      if (next?.trim()) renameChapter(ch.id, next.trim());
                    }}
                  >
                    {ch.title}
                  </button>
                  <StatusDot chapter={ch} />
                  <div className="hidden group-hover:flex">
                    <IconBtn label="Move up" onClick={() => moveChapter(ch.id, -1)} disabled={idx === 0}>
                      ↑
                    </IconBtn>
                    <IconBtn
                      label="Move down"
                      onClick={() => moveChapter(ch.id, 1)}
                      disabled={idx === book.chapters.length - 1}
                    >
                      ↓
                    </IconBtn>
                    <button
                      type="button"
                      className="size-7 text-muted-foreground hover:text-destructive"
                      aria-label="Delete chapter"
                      onClick={() => deleteChapter(ch.id)}
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
                {expanded ? (
                  <ul className="ml-6">
                    {ch.sections.map((sec, sidx) => {
                      const secSel = selection?.chapterId === ch.id && selection.sectionId === sec.id;
                      return (
                        <li key={sec.id} className={cn("group flex items-center gap-1 rounded-md px-1 py-0.5", secSel && "bg-secondary")}>
                          <button
                            type="button"
                            className="min-w-0 flex-1 truncate py-1 text-left text-sm text-muted-foreground"
                            onClick={() => select({ chapterId: ch.id, sectionId: sec.id })}
                            onDoubleClick={() => {
                              const next = window.prompt("Section title", sec.title);
                              if (next?.trim()) renameSection(ch.id, sec.id, next.trim());
                            }}
                          >
                            {sec.title}
                          </button>
                          <span className="text-[10px] tabular-nums text-muted-foreground">
                            {wordCount(sec.content) || ""}
                          </span>
                          <div className="hidden group-hover:flex">
                            <IconBtn label="Up" onClick={() => moveSection(ch.id, sec.id, -1)} disabled={sidx === 0}>
                              ↑
                            </IconBtn>
                            <IconBtn
                              label="Down"
                              onClick={() => moveSection(ch.id, sec.id, 1)}
                              disabled={sidx === ch.sections.length - 1}
                            >
                              ↓
                            </IconBtn>
                            <button
                              type="button"
                              className="size-7 text-muted-foreground hover:text-destructive"
                              aria-label="Delete section"
                              onClick={() => deleteSection(ch.id, sec.id)}
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </div>
                        </li>
                      );
                    })}
                    <li>
                      <button
                        type="button"
                        className="px-1 py-1 text-xs text-muted-foreground hover:text-foreground"
                        onClick={() => addSection(ch.id)}
                      >
                        Add section
                      </button>
                    </li>
                  </ul>
                ) : null}
              </li>
            );
          })}
        </ul>
      </ScrollArea>
    </div>
  );
}

function StatusDot({ chapter }: { chapter: Chapter }) {
  const empty =
    chapter.sections.length === 0
      ? !chapter.content.trim()
      : chapter.sections.some((s) => !s.content.trim());
  return (
    <span
      className={cn("size-1.5 rounded-full", empty ? "bg-muted-foreground/40" : "bg-success")}
      title={empty ? "Incomplete" : "Has content"}
    />
  );
}

function IconBtn({
  children,
  onClick,
  disabled,
  label,
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="size-7 text-xs text-muted-foreground disabled:opacity-30"
    >
      {children}
    </button>
  );
}
