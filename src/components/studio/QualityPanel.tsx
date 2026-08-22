import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useStudio } from "@/lib/book/studio-store";
import { cn } from "@/lib/utils";

export function QualityPanel({
  open,
  onOpenChange,
  onRunAi,
  busy,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onRunAi: () => void;
  busy: boolean;
}) {
  const book = useStudio((s) => s.book);
  const report = book?.qualityReport;
  if (!book) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] max-w-lg overflow-auto">
        <DialogHeader>
          <DialogTitle>Quality control</DialogTitle>
          <DialogDescription>
            Structural checks run on this device. Optional AI review looks for style and contradictions.
          </DialogDescription>
        </DialogHeader>
        {report ? (
          <div>
            <p className="font-display text-4xl tabular-nums">{report.score}/100</p>
            <p className="mt-2 text-sm text-muted-foreground">{report.summary}</p>
            <ul className="mt-4 flex flex-col gap-2">
              {report.issues.length === 0 ? (
                <li className="text-sm text-muted-foreground">No issues found.</li>
              ) : (
                report.issues.map((iss) => (
                  <li key={iss.id} className="rounded-lg border border-border p-3">
                    <p className="flex items-center gap-2 text-sm">
                      <span
                        className={cn(
                          "size-1.5 rounded-full",
                          iss.severity === "error"
                            ? "bg-destructive"
                            : iss.severity === "warning"
                              ? "bg-primary"
                              : "bg-muted-foreground",
                        )}
                      />
                      {iss.title}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">{iss.detail}</p>
                  </li>
                ))
              )}
            </ul>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Run a check to score this manuscript.</p>
        )}
        <Button disabled={busy} onClick={onRunAi}>
          {busy ? "Reviewing…" : "Run AI review"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
