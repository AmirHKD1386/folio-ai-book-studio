import { useState } from "react";
import {
  Sparkles,
  RefreshCw,
  Expand,
  Minimize2,
  PenLine,
  Wand2,
  CornerDownRight,
  Languages,
  Terminal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useStudio, useSelectedNode } from "@/lib/book/studio-store";
import type { AiAction } from "@/lib/book/types";
import { wordCount } from "@/lib/utils";

const ACTIONS: { id: AiAction; label: string; icon: typeof Sparkles; needsContent?: boolean }[] = [
  { id: "generate-section", label: "Generate", icon: Sparkles },
  { id: "regenerate", label: "Regenerate", icon: RefreshCw, needsContent: true },
  { id: "expand", label: "Expand", icon: Expand, needsContent: true },
  { id: "shorten", label: "Shorten", icon: Minimize2, needsContent: true },
  { id: "rewrite", label: "Rewrite", icon: PenLine, needsContent: true },
  { id: "improve", label: "Improve", icon: Wand2, needsContent: true },
  { id: "continue", label: "Continue", icon: CornerDownRight, needsContent: true },
  { id: "simplify", label: "Simplify", icon: Languages, needsContent: true },
];

export function AssistantPanel({
  busy,
  selectedText,
  onAction,
  onCustom,
}: {
  busy: boolean;
  selectedText: string;
  onAction: (action: AiAction) => void;
  onCustom: (command: string) => void;
}) {
  const book = useStudio((s) => s.book);
  const node = useSelectedNode();
  const [command, setCommand] = useState("");

  if (!book) return null;
  const content = node?.section?.content ?? node?.chapter.content ?? "";
  const hasContent = Boolean(content.trim());

  return (
    <div className="flex h-full flex-col bg-card">
      <div className="border-b border-border px-3 py-3">
        <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Assistant</p>
        <p className="mt-1 truncate text-sm">
          {node?.section?.title ?? node?.chapter.title ?? "No selection"}
        </p>
      </div>
      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-2 p-3">
          {ACTIONS.map((a) => {
            const Icon = a.icon;
            const disabled = busy || (a.needsContent && !hasContent && !selectedText);
            return (
              <Button
                key={a.id}
                variant="secondary"
                className="justify-start"
                disabled={disabled}
                onClick={() => onAction(a.id)}
              >
                <Icon className="size-4" />
                {a.label}
              </Button>
            );
          })}
          <div className="mt-2 rounded-lg border border-border p-3">
            <p className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-muted-foreground">
              <Terminal className="size-3.5" />
              Custom command
            </p>
            <Textarea
              rows={3}
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              placeholder="Make this section more concrete, with a worked example."
            />
            <Button
              className="mt-2 w-full"
              disabled={busy || !command.trim()}
              onClick={() => {
                onCustom(command.trim());
                setCommand("");
              }}
            >
              Run
            </Button>
          </div>
          {selectedText ? (
            <p className="text-xs text-muted-foreground">
              Selection: {wordCount(selectedText)} words will be sent instead of the whole section.
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">
              Select text in the editor to rewrite only that passage.
            </p>
          )}
          <UsageCard
            input={book.usage.inputTokens}
            output={book.usage.outputTokens}
            cost={book.usage.estimatedCostUsd}
            calls={book.usage.calls}
          />
        </div>
      </ScrollArea>
    </div>
  );
}

function UsageCard({
  input,
  output,
  cost,
  calls,
}: {
  input: number;
  output: number;
  cost: number;
  calls: number;
}) {
  return (
    <div className="mt-2 rounded-lg border border-border p-3 text-xs text-muted-foreground">
      <p className="uppercase tracking-[0.16em]">Usage</p>
      <dl className="mt-2 grid grid-cols-2 gap-y-1 tabular-nums">
        <dt>Input</dt>
        <dd className="text-right text-foreground">{input.toLocaleString()}</dd>
        <dt>Output</dt>
        <dd className="text-right text-foreground">{output.toLocaleString()}</dd>
        <dt>Total</dt>
        <dd className="text-right text-foreground">{(input + output).toLocaleString()}</dd>
        <dt>Calls</dt>
        <dd className="text-right text-foreground">{calls}</dd>
        <dt>Est. cost</dt>
        <dd className="text-right text-foreground">${cost.toFixed(3)}</dd>
      </dl>
    </div>
  );
}
