import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  Download,
  FileText,
  Loader2,
  PanelLeft,
  Settings2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Group as PanelGroup, Panel, Separator as PanelResize } from "react-resizable-panels";
import { Button } from "@/components/ui/button";
import { StructurePanel } from "./StructurePanel";
import { EditorPanel } from "./EditorPanel";
import { AssistantPanel } from "./AssistantPanel";
import { GenerateOverlay } from "./GenerateOverlay";
import { SettingsDialog } from "./SettingsDialog";
import { QualityPanel } from "./QualityPanel";
import { useStudio } from "@/lib/book/studio-store";
import { flattenNodes } from "@/lib/book/outline";
import { applyGenerated, generateNode, runAiAction, summarizeChapter, toCompleteRequest } from "@/lib/book/generate";
import { runHeuristicQuality, manuscriptDigest } from "@/lib/book/quality";
import { buildQualityPrompt } from "@/lib/book/prompts";
import { streamComplete, addUsage } from "@/lib/ai/client";
import { buildDocx, chapterExportBody } from "@/lib/document/docx";
import { bookToMarkdown } from "@/lib/document/markdown";
import { downloadBlob, isRtlLanguage } from "@/lib/utils";
import { exportProjectJson } from "@/lib/book/storage";
import type { AiAction, BookProject } from "@/lib/book/types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function StudioApp({ bookId }: { bookId: string }) {
  const load = useStudio((s) => s.load);
  const book = useStudio((s) => s.book);
  const loading = useStudio((s) => s.loading);
  const error = useStudio((s) => s.error);
  const patch = useStudio((s) => s.patch);
  const persist = useStudio((s) => s.persist);
  const select = useStudio((s) => s.select);
  const lastSavedAt = useStudio((s) => s.lastSavedAt);
  const saving = useStudio((s) => s.saving);

  const [mobileTab, setMobileTab] = useState<"structure" | "write" | "assist">("write");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [qualityOpen, setQualityOpen] = useState(false);
  const [qualityBusy, setQualityBusy] = useState(false);
  const [selectedText, setSelectedText] = useState("");
  const [streaming, setStreaming] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const abortRef = useRef({ pause: false, cancel: false });

  useEffect(() => {
    void load(bookId);
  }, [bookId, load]);

  useEffect(() => {
    const t = setInterval(() => {
      void persist();
    }, 20000);
    return () => clearInterval(t);
  }, [persist]);

  const runNode = useCallback(
    async (project: BookProject, chapterId: string, sectionId?: string) => {
      const chapter = project.chapters.find((c) => c.id === chapterId);
      if (!chapter) return { error: "Chapter missing", retryable: false } as const;
      const section = sectionId ? chapter.sections.find((s) => s.id === sectionId) : undefined;
      select({ chapterId, sectionId });
      setStreaming("");
      let acc = "";
      const result = await generateNode(project, chapter, section, (d) => {
        acc += d;
        setStreaming(acc);
      });
      setStreaming(null);
      return result;
    },
    [select],
  );

  async function generateSelection() {
    const state = useStudio.getState();
    const current = state.book;
    const sel = state.selection;
    if (!current || !sel) return;
    setBusy(true);
    const result = await runNode(current, sel.chapterId, sel.sectionId);
    if ("error" in result) {
      toast.error(result.error);
      setBusy(false);
      return;
    }
    const withText = applyGenerated(current, sel.chapterId, sel.sectionId, result.text, result.usage);
    const chapter = withText.chapters.find((c) => c.id === sel.chapterId)!;
    const ctx = await summarizeChapter(withText, chapter);
    patch(() => ({ ...withText, context: ctx }));
    await persist();
    setBusy(false);
  }

  async function handleAction(action: AiAction, customCommand?: string) {
    if (action === "generate-section" || action === "generate-chapter") {
      await generateSelection();
      return;
    }
    const state = useStudio.getState();
    const current = state.book;
    const node = state.selectedNode();
    if (!current || !node) return;
    setBusy(true);
    setStreaming("");
    let acc = "";
    const result = await runAiAction(current, node.chapter, action, {
      section: node.section,
      selectedText: selectedText || undefined,
      customCommand,
      onDelta: (d) => {
        acc += d;
        setStreaming(acc);
      },
    });
    setStreaming(null);
    if ("error" in result) {
      toast.error(result.error);
      setBusy(false);
      return;
    }
    if (selectedText && node.section) {
      const next = node.section.content.replace(selectedText, result.text);
      patch((b) =>
        applyGenerated(b, node.chapter.id, node.section?.id, next, result.usage),
      );
    } else if (selectedText && !node.section) {
      const next = node.chapter.content.replace(selectedText, result.text);
      patch((b) => applyGenerated(b, node.chapter.id, undefined, next, result.usage));
    } else {
      patch((b) =>
        applyGenerated(b, node.chapter.id, node.section?.id, result.text, result.usage),
      );
    }
    setBusy(false);
  }

  async function generateEntireBook(resume = false) {
    const start = useStudio.getState().book;
    if (!start) return;
    const nodes = flattenNodes(start.chapters);
    if (nodes.length === 0) {
      toast.error("Add at least one chapter before generating.");
      return;
    }
    abortRef.current = { pause: false, cancel: false };
    const already = resume ? start.generation.completedNodeIds : [];
    patch((b) => ({
      ...b,
      generation: {
        status: "running",
        completedNodeIds: already,
        totalNodes: nodes.length,
        message: "Starting…",
        startedAt: b.generation.startedAt ?? Date.now(),
        updatedAt: Date.now(),
      },
    }));
    setBusy(true);

    let working = useStudio.getState().book!;
    for (const node of nodes) {
      if (abortRef.current.cancel) break;
      while (abortRef.current.pause && !abortRef.current.cancel) {
        await new Promise((r) => setTimeout(r, 200));
      }
      if (abortRef.current.cancel) break;
      if (already.includes(node.nodeId) && resume) continue;

      const chapterLabel = `Chapter ${working.chapters.findIndex((c) => c.id === node.chapter.id) + 1} / ${working.chapters.length}`;
      const sectionLabel = node.section
        ? `Section ${node.chapter.sections.findIndex((s) => s.id === node.section!.id) + 1} / ${node.chapter.sections.length}`
        : "Full chapter";
      patch((b) => ({
        ...b,
        generation: {
          ...b.generation,
          status: "running",
          currentChapterId: node.chapter.id,
          currentSectionId: node.section?.id,
          message: `${chapterLabel} · ${sectionLabel}`,
          updatedAt: Date.now(),
        },
      }));
      select({ chapterId: node.chapter.id, sectionId: node.section?.id });

      const result = await runNode(working, node.chapter.id, node.section?.id);
      if ("error" in result) {
        patch((b) => ({
          ...b,
          generation: {
            ...b.generation,
            status: "error",
            error: result.error,
            message: "Paused on failure — resume to continue.",
          },
        }));
        await persist();
        toast.error(result.error);
        setBusy(false);
        return;
      }
      working = applyGenerated(
        working,
        node.chapter.id,
        node.section?.id,
        result.text,
        result.usage,
      );
      const ch = working.chapters.find((c) => c.id === node.chapter.id)!;
      const isLastSection =
        !node.section || node.section.id === ch.sections[ch.sections.length - 1]?.id;
      if (isLastSection) {
        working = { ...working, context: await summarizeChapter(working, ch) };
      }
      working = {
        ...working,
        generation: {
          ...working.generation,
          status: "running",
          completedNodeIds: [...working.generation.completedNodeIds, node.nodeId],
          totalNodes: nodes.length,
          updatedAt: Date.now(),
        },
      };
      patch(() => working);
      await persist();
    }

    if (abortRef.current.cancel) {
      patch((b) => ({ ...b, generation: { ...b.generation, status: "cancelled", message: "Cancelled." } }));
      setBusy(false);
      return;
    }

    const checked = runHeuristicQuality(working);
    working = {
      ...working,
      qualityReport: checked,
      generation: {
        ...working.generation,
        status: "complete",
        message: "Manuscript complete.",
        completedNodeIds: flattenNodes(working.chapters).map((n) => n.nodeId),
      },
    };
    patch(() => working);
    await persist();
    setBusy(false);
    setQualityOpen(true);
    toast.success("The book is drafted. Review, then export.");
  }

  async function exportDocx() {
    const current = useStudio.getState().book;
    if (!current) return;
    try {
      const blob = await buildDocx(current);
      downloadBlob(blob, `${slug(current.title)}.docx`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Word export failed.");
    }
  }

  function exportMd() {
    const current = useStudio.getState().book;
    if (!current) return;
    const md = bookToMarkdown(
      current.title,
      current.subtitle,
      current.author,
      current.chapters.map((c) => ({ title: c.title, body: chapterExportBody(c) })),
    );
    downloadBlob(new Blob([md], { type: "text/markdown" }), `${slug(current.title)}.md`);
  }

  function exportTxt() {
    const current = useStudio.getState().book;
    if (!current) return;
    const text = current.chapters
      .map((c) => `${c.title}\n\n${chapterExportBody(c)}`)
      .join("\n\n");
    downloadBlob(new Blob([text], { type: "text/plain" }), `${slug(current.title)}.txt`);
  }

  function exportJson() {
    const current = useStudio.getState().book;
    if (!current) return;
    downloadBlob(
      new Blob([exportProjectJson(current)], { type: "application/json" }),
      `${slug(current.title)}.folio.json`,
    );
  }

  async function runQuality(ai = false) {
    const current = useStudio.getState().book;
    if (!current) return;
    const heuristic = runHeuristicQuality(current);
    patch((b) => ({ ...b, qualityReport: heuristic }));
    setQualityOpen(true);
    if (!ai) return;
    setQualityBusy(true);
    try {
      const prompt = buildQualityPrompt(current, manuscriptDigest(current));
      const req = await toCompleteRequest(current, [
        { role: "system", content: prompt.system },
        { role: "user", content: prompt.user },
      ], 900);
      const result = await streamComplete(req, () => {});
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      const jsonStart = result.text.indexOf("{");
      const jsonEnd = result.text.lastIndexOf("}");
      if (jsonStart >= 0 && jsonEnd > jsonStart) {
        const parsed = JSON.parse(result.text.slice(jsonStart, jsonEnd + 1)) as {
          score?: number;
          summary?: string;
          issues?: { severity?: string; title?: string; detail?: string; category?: string }[];
        };
        patch((b) => ({
          ...b,
          usage: addUsage(b.usage, result.usage),
          qualityReport: {
            score: typeof parsed.score === "number" ? parsed.score : heuristic.score,
            createdAt: Date.now(),
            summary: parsed.summary || heuristic.summary,
            issues: [
              ...heuristic.issues,
              ...(parsed.issues ?? []).map((iss, i) => ({
                id: `ai_${i}`,
                severity: (iss.severity as "info" | "warning" | "error") || "info",
                title: iss.title || "Issue",
                detail: iss.detail || "",
                category: iss.category || "style",
              })),
            ],
          },
        }));
      }
    } catch {
      toast.error("Could not parse the AI review. Structural score is still available.");
    } finally {
      setQualityBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center text-muted-foreground">
        <Loader2 className="mr-2 size-4 animate-spin" />
        Opening manuscript…
      </div>
    );
  }
  if (error || !book) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="font-display text-2xl">{error || "Manuscript not found"}</p>
        <Button asChild>
          <Link to="/">Back to library</Link>
        </Button>
      </div>
    );
  }

  const gen = book.generation;
  const chapter = book.chapters.find((c) => c.id === gen.currentChapterId);
  const section = chapter?.sections.find((s) => s.id === gen.currentSectionId);
  const rtl = isRtlLanguage(book.language);

  return (
    <div className={cn("flex h-dvh flex-col bg-background", rtl && "font-persian")} dir={rtl ? "rtl" : "ltr"}>
      <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-2 sm:px-3">
        <Button variant="ghost" size="icon-sm" asChild>
          <Link to="/" aria-label="Library">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-base leading-tight">{book.title}</p>
          <p className="truncate text-[11px] text-muted-foreground">
            {saving ? "Saving…" : lastSavedAt ? "Saved" : "Local manuscript"}
            {` · ${book.ai.model}`}
          </p>
        </div>
        <Button
          size="sm"
          className="hidden sm:inline-flex"
          disabled={busy}
          onClick={() => void generateEntireBook(gen.status === "paused" || gen.status === "error")}
        >
          <Sparkles className="size-4" />
          {gen.status === "paused" || gen.status === "error" ? "Resume book" : "Generate entire book"}
        </Button>
        <Button size="icon-sm" variant="ghost" onClick={() => void runQuality(false)} aria-label="Quality">
          <ShieldCheck className="size-4" />
        </Button>
        <Button size="icon-sm" variant="ghost" onClick={() => setSettingsOpen(true)} aria-label="Settings">
          <Settings2 className="size-4" />
        </Button>
        <div className="hidden sm:flex">
          <Button size="icon-sm" variant="ghost" onClick={() => void exportDocx()} aria-label="Export Word">
            <Download className="size-4" />
          </Button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <div className="hidden min-h-0 flex-1 md:flex">
          <PanelGroup orientation="horizontal" className="h-full flex-1">
            <Panel defaultSize="22%" minSize="16%" className="min-h-0">
              <StructurePanel />
            </Panel>
            <PanelResize className="w-px bg-border" />
            <Panel defaultSize="54%" minSize="34%" className="min-h-0">
              <EditorPanel streaming={streaming} onSelectionChange={setSelectedText} />
            </Panel>
            <PanelResize className="w-px bg-border" />
            <Panel defaultSize="24%" minSize="18%" className="min-h-0">
              <AssistantPanel
                busy={busy}
                selectedText={selectedText}
                onAction={(a) => void handleAction(a)}
                onCustom={(c) => void handleAction("custom", c)}
              />
            </Panel>
          </PanelGroup>
        </div>

        <div className="flex min-h-0 flex-1 flex-col md:hidden">
          <div className="min-h-0 flex-1">
            {mobileTab === "structure" ? <StructurePanel /> : null}
            {mobileTab === "write" ? (
              <EditorPanel streaming={streaming} onSelectionChange={setSelectedText} />
            ) : null}
            {mobileTab === "assist" ? (
              <AssistantPanel
                busy={busy}
                selectedText={selectedText}
                onAction={(a) => void handleAction(a)}
                onCustom={(c) => void handleAction("custom", c)}
              />
            ) : null}
          </div>
          <nav className="grid grid-cols-3 border-t border-border bg-card pb-[env(safe-area-inset-bottom)]">
            {(
              [
                ["structure", "Structure", PanelLeft],
                ["write", "Write", FileText],
                ["assist", "Assist", Sparkles],
              ] as const
            ).map(([id, label, Icon]) => (
              <button
                key={id}
                type="button"
                onClick={() => setMobileTab(id)}
                className={cn(
                  "flex h-12 flex-col items-center justify-center text-[11px]",
                  mobileTab === id ? "text-foreground" : "text-muted-foreground",
                )}
              >
                <Icon className="size-4" />
                {label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="flex items-center gap-2 border-t border-border px-3 py-2 md:hidden">
        <Button
          className="flex-1"
          size="sm"
          disabled={busy}
          onClick={() => void generateEntireBook(gen.status === "paused" || gen.status === "error")}
        >
          Generate book
        </Button>
        <Button size="sm" variant="secondary" onClick={() => void exportDocx()}>
          .docx
        </Button>
        <Button size="sm" variant="ghost" onClick={exportMd}>
          .md
        </Button>
      </div>

      <div className="hidden border-t border-border px-3 py-1.5 text-[11px] text-muted-foreground md:flex md:items-center md:gap-3">
        <button type="button" className="hover:text-foreground" onClick={exportMd}>
          Export Markdown
        </button>
        <button type="button" className="hover:text-foreground" onClick={exportTxt}>
          Export text
        </button>
        <button type="button" className="hover:text-foreground" onClick={exportJson}>
          Export project
        </button>
        <span className="ml-auto tabular-nums">
          {book.usage.totalTokens.toLocaleString()} tokens · ${book.usage.estimatedCostUsd.toFixed(3)}
        </span>
      </div>

      <GenerateOverlay
        state={gen}
        chapterLabel={chapter?.title ?? ""}
        sectionLabel={section?.title ?? ""}
        onPause={() => {
          abortRef.current.pause = true;
          patch((b) => ({ ...b, generation: { ...b.generation, status: "paused", message: "Paused." } }));
        }}
        onResume={() => {
          abortRef.current.pause = false;
          if (gen.status === "paused" && busy) {
            patch((b) => ({ ...b, generation: { ...b.generation, status: "running" } }));
          } else {
            void generateEntireBook(true);
          }
        }}
        onCancel={() => {
          abortRef.current.cancel = true;
          abortRef.current.pause = false;
          patch((b) => ({ ...b, generation: { ...b.generation, status: "cancelled", message: "Cancelled." } }));
        }}
      />
      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
      <QualityPanel
        open={qualityOpen}
        onOpenChange={setQualityOpen}
        onRunAi={() => void runQuality(true)}
        busy={qualityBusy}
      />
    </div>
  );
}

function slug(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9\u0600-\u06FF]+/g, "-").replace(/^-|-$/g, "") || "book";
}
