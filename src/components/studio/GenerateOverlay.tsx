import { Pause, Play, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { GenerationState } from "@/lib/book/types";

export function GenerateOverlay({
  state,
  chapterLabel,
  sectionLabel,
  onPause,
  onResume,
  onCancel,
}: {
  state: GenerationState;
  chapterLabel: string;
  sectionLabel: string;
  onPause: () => void;
  onResume: () => void;
  onCancel: () => void;
}) {
  if (state.status === "idle" || state.status === "complete") return null;
  const pct = state.totalNodes
    ? Math.round((state.completedNodeIds.length / state.totalNodes) * 100)
    : 0;

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-background/70 p-4 sm:items-center">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-lg">
        <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Generating book</p>
        <h2 className="mt-2 font-display text-2xl tracking-tight">
          {state.status === "paused"
            ? "Paused"
            : state.status === "error"
              ? "Stopped"
              : state.status === "cancelled"
                ? "Cancelled"
                : "Writing…"}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">{state.message || chapterLabel}</p>
        {sectionLabel ? <p className="text-sm text-muted-foreground">{sectionLabel}</p> : null}
        <div className="mt-5">
          <Progress value={pct} />
          <p className="mt-2 text-xs tabular-nums text-muted-foreground">
            {state.completedNodeIds.length} / {state.totalNodes} · {pct}%
          </p>
        </div>
        {state.error ? <p className="mt-3 text-sm text-destructive">{state.error}</p> : null}
        <div className="mt-6 flex flex-wrap gap-2">
          {state.status === "running" ? (
            <Button variant="secondary" onClick={onPause}>
              <Pause className="size-4" />
              Pause
            </Button>
          ) : null}
          {state.status === "paused" || state.status === "error" ? (
            <Button onClick={onResume}>
              <Play className="size-4" />
              Resume
            </Button>
          ) : null}
          {state.status !== "cancelled" ? (
            <Button variant="ghost" onClick={onCancel}>
              <X className="size-4" />
              Cancel
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
