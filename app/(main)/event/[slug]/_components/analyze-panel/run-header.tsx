"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { STATUS_LABEL, STATUS_VARIANT } from "./constants";

export function AnalyzeRunHeader({
  status,
  startedAt,
  completedAt,
  onStart,
  onCancel,
  starting,
  active,
  isAuthenticated,
}: {
  status: string;
  startedAt: number;
  completedAt?: number;
  onStart: () => void;
  onCancel: () => void;
  starting: boolean;
  active: boolean;
  isAuthenticated: boolean;
}) {
  const [nowMs, setNowMs] = useState(() => Date.now());
  useEffect(() => {
    if (completedAt != null) return;
    const id = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [completedAt]);

  const label = STATUS_LABEL[status] ?? status;
  const variant = STATUS_VARIANT[status] ?? "secondary";
  const duration = (completedAt ?? nowMs) - startedAt;
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border/60 bg-muted/20 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <Badge variant={variant} className="gap-1.5">
          {active && <Loader2 className="h-3 w-3 animate-spin" />}
          {!active && status === "completed" && (
            <CheckCircle2 className="h-3 w-3" />
          )}
          {label}
        </Badge>
        <p className="text-xs text-muted-foreground">
          Started {new Date(startedAt).toLocaleString()}
          {completedAt ? ` · ${Math.round(duration / 1000)}s` : null}
        </p>
      </div>
      <div className="flex items-center gap-2">
        {active ? (
          <Button variant="outline" size="sm" onClick={onCancel}>
            Cancel
          </Button>
        ) : isAuthenticated ? (
          <Button size="sm" onClick={onStart} disabled={starting}>
            {starting ? (
              <>
                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> Starting…
              </>
            ) : (
              "Re-run analysis"
            )}
          </Button>
        ) : (
          <Button size="sm" asChild variant="outline" className="gap-1.5">
            <Link href="/login">
              <Lock className="h-3.5 w-3.5" />
              Sign in to re-run
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
