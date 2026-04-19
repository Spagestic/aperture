"use client";

import { cn } from "@/lib/utils";

export type ResearchLogRow = {
  _id: string;
  ts: number;
  phase: string;
  level: string;
  message: string;
};

export function AnalyzeLogsPanel({ logs }: { logs: ResearchLogRow[] }) {
  return (
    <details className="rounded-lg border border-border/40 bg-muted/10 p-3 text-xs">
      <summary className="cursor-pointer text-muted-foreground">
        Debug log ({logs.length})
      </summary>
      <div className="mt-2 max-h-64 space-y-1 overflow-auto font-mono text-[11px]">
        {logs.map((l) => (
          <div
            key={l._id}
            className={cn(
              "flex gap-2",
              l.level === "error" && "text-destructive",
              l.level === "warn" && "text-amber-600 dark:text-amber-400",
            )}
          >
            <span className="shrink-0 text-muted-foreground">
              {new Date(l.ts).toLocaleTimeString()}
            </span>
            <span className="shrink-0 text-muted-foreground">[{l.phase}]</span>
            <span className="whitespace-pre-wrap break-all">{l.message}</span>
          </div>
        ))}
      </div>
    </details>
  );
}
