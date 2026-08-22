import { useEffect, useMemo, useRef, useState } from "react";
import { Eye, History, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useStudio } from "@/lib/book/studio-store";
import { restoreVersion } from "@/lib/book/versions";
import { isRtlLanguage, wordCount } from "@/lib/utils";
import { parseMarkdown } from "@/lib/document/markdown";
import { cn } from "@/lib/utils";

export function EditorPanel({
  streaming,
  onSelectionChange,
}: {
  streaming: string | null;
  onSelectionChange: (text: string) => void;
}) {
  const book = useStudio((s) => s.book);
  const selection = useStudio((s) => s.selection);
  const setContent = useStudio((s) => s.setContent);
  const patch = useStudio((s) => s.patch);
  const [preview, setPreview] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const areaRef = useRef<HTMLTextAreaElement>(null);

  const node = useMemo(() => {
    if (!book || !selection) return null;
    const chapter = book.chapters.find((c) => c.id === selection.chapterId);
    if (!chapter) return null;
    const section = selection.sectionId
      ? chapter.sections.find((s) => s.id === selection.sectionId)
      : undefined;
    return { chapter, section };
  }, [book, selection]);

  const content = streaming ?? (node?.section ? node.section.content : node?.chapter.content ?? "");
  const versions = node?.section ? node.section.versions : node?.chapter.versions ?? [];
  const rtl = book ? isRtlLanguage(book.language) : false;

  useEffect(() => {
    setHistoryOpen(false);
  }, [selection?.chapterId, selection?.sectionId]);

  if (!book || !node) {
    return (
      <div className="flex h-full items-center justify-center bg-paper text-ink-muted">
        Select a chapter to write.
      </div>
    );
  }

  const title = node.section?.title ?? node.chapter.title;
  const outline = node.section?.outline || node.chapter.outline || node.chapter.objective;

  function onSelect() {
    const el = areaRef.current;
    if (!el) return;
    const selected = el.value.slice(el.selectionStart, el.selectionEnd);
    onSelectionChange(selected);
  }

  function restore(id: string) {
    if (!node) return;
    const target = node.section ?? node.chapter;
    const next = restoreVersion(target, id);
    if (!next) return;
    patch((b) => ({
      ...b,
      chapters: b.chapters.map((ch) => {
        if (ch.id !== node.chapter.id) return ch;
        if (node.section) {
          return {
            ...ch,
            sections: ch.sections.map((s) =>
              s.id === node.section!.id ? { ...s, ...next } : s,
            ),
          };
        }
        return { ...ch, ...next };
      }),
    }));
  }

  return (
    <div className="flex h-full flex-col bg-paper text-ink">
      <div className="flex items-start justify-between gap-3 border-b border-ink/10 px-4 py-3 sm:px-8">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.16em] text-ink-muted">
            {node.section ? node.chapter.title : node.chapter.type}
          </p>
          <h2 className="font-display text-2xl tracking-tight text-ink">{title}</h2>
          {outline ? <p className="mt-1 line-clamp-2 text-sm text-ink-muted">{outline}</p> : null}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Button
            size="icon-sm"
            variant="ghost"
            className="text-ink-muted hover:bg-ink/5 hover:text-ink"
            onClick={() => setPreview((p) => !p)}
            aria-label="Toggle preview"
          >
            <Eye className="size-4" />
          </Button>
          <Button
            size="icon-sm"
            variant="ghost"
            className="text-ink-muted hover:bg-ink/5 hover:text-ink"
            onClick={() => setHistoryOpen((p) => !p)}
            aria-label="Version history"
          >
            <History className="size-4" />
          </Button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1">
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          {preview ? (
            <article
              dir={rtl ? "rtl" : "ltr"}
              className={cn(
                "manuscript-editor flex-1 overflow-auto px-4 py-6 sm:px-10",
                rtl && "font-persian",
              )}
            >
              <MarkdownView text={content} />
            </article>
          ) : (
            <Textarea
              ref={areaRef}
              dir={rtl ? "rtl" : "ltr"}
              className={cn(
                "manuscript-editor min-h-0 flex-1 resize-none rounded-none border-0 bg-transparent px-4 py-6 shadow-none focus-visible:ring-0 sm:px-10",
                rtl && "font-persian",
              )}
              value={content}
              disabled={streaming !== null}
              onChange={(e) => setContent(e.target.value, "edit")}
              onSelect={onSelect}
              onKeyUp={onSelect}
              placeholder="Write here, or generate this chapter from the assistant."
            />
          )}
          <div className="flex items-center justify-between border-t border-ink/10 px-4 py-2 text-xs tabular-nums text-ink-muted sm:px-8">
            <span>{wordCount(content)} words</span>
            <span>{node.section?.status ?? node.chapter.status}</span>
          </div>
        </div>
        {historyOpen ? (
          <aside className="w-56 shrink-0 overflow-auto border-l border-ink/10 bg-paper p-3">
            <p className="text-xs uppercase tracking-[0.16em] text-ink-muted">Versions</p>
            {versions.length === 0 ? (
              <p className="mt-3 text-sm text-ink-muted">No snapshots yet. Generates and AI edits are kept automatically.</p>
            ) : (
              <ul className="mt-3 flex flex-col gap-2">
                {[...versions].reverse().map((v) => (
                  <li key={v.id} className="rounded-md border border-ink/10 p-2">
                    <p className="text-xs text-ink">{v.label}</p>
                    <p className="text-[10px] text-ink-muted">
                      {new Date(v.createdAt).toLocaleString()}
                    </p>
                    <p className="mt-1 line-clamp-3 text-[11px] text-ink-muted">{v.content}</p>
                    <button
                      type="button"
                      className="mt-2 inline-flex items-center gap-1 text-xs text-ink"
                      onClick={() => restore(v.id)}
                    >
                      <RotateCcw className="size-3" />
                      Restore
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </aside>
        ) : null}
      </div>
    </div>
  );
}

function MarkdownView({ text }: { text: string }) {
  const blocks = parseMarkdown(text || "");
  if (!text.trim()) return <p className="text-ink-muted">Nothing on the page yet.</p>;
  return (
    <div className="flex flex-col gap-3">
      {blocks.map((b, i) => {
        if (b.type === "h1") return <h3 key={i} className="font-display text-xl">{b.text}</h3>;
        if (b.type === "h2" || b.type === "h3")
          return <h4 key={i} className="font-display text-lg">{b.text}</h4>;
        if (b.type === "quote")
          return <blockquote key={i} className="border-l-2 border-ink/20 pl-3 italic">{b.text}</blockquote>;
        if (b.type === "code")
          return (
            <pre key={i} className="overflow-auto rounded-md bg-ink/5 p-3 font-mono text-sm">
              {b.text}
            </pre>
          );
        if (b.type === "ul")
          return (
            <ul key={i} className="list-disc pl-5">
              {b.items.map((it, j) => (
                <li key={j}>{it}</li>
              ))}
            </ul>
          );
        if (b.type === "ol")
          return (
            <ol key={i} className="list-decimal pl-5">
              {b.items.map((it, j) => (
                <li key={j}>{it}</li>
              ))}
            </ol>
          );
        return <p key={i}>{b.text}</p>;
      })}
    </div>
  );
}
