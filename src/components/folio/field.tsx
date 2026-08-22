import type { ReactNode } from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function Field({
  label,
  hint,
  className,
  children,
}: {
  label: string;
  hint?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <span className="flex items-baseline justify-between gap-3">
        <Label className="text-muted-foreground">{label}</Label>
        {hint ? <span className="text-xs text-muted-foreground/80">{hint}</span> : null}
      </span>
      {children}
    </div>
  );
}
