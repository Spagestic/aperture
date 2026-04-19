"use client";

import Link from "next/link";
import { Loader2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AnalyzeEmptyState({
  onStart,
  starting,
  isAuthenticated,
}: {
  onStart: () => void;
  starting: boolean;
  isAuthenticated: boolean;
}) {
  return (
    <div className="flex min-h-90 flex-col items-center justify-center gap-4 rounded-lg border border-border/60 bg-muted/20 p-6 text-center">
      <div className="max-w-md space-y-2">
        <p className="text-lg font-semibold">Research this event</p>
        <p className="text-sm text-muted-foreground">
          We&apos;ll classify whether the event is researchable, plan a set of
          research questions, search and scrape the web in parallel, then
          synthesize a memo with recommended markets and sides.
        </p>
      </div>
      {isAuthenticated ? (
        <Button size="lg" onClick={onStart} disabled={starting}>
          {starting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Starting…
            </>
          ) : (
            "Start analysis"
          )}
        </Button>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <Button size="lg" disabled className="gap-2">
            <Lock className="h-4 w-4" />
            Sign in to analyze
          </Button>
          <p className="text-xs text-muted-foreground">
            <Link href="/login" className="underline underline-offset-4">
              Log in
            </Link>{" "}
            or{" "}
            <Link href="/signup" className="underline underline-offset-4">
              create an account
            </Link>{" "}
            to start an analysis.
          </p>
        </div>
      )}
    </div>
  );
}
