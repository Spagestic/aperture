"use client";

import { useMutation, useQuery } from "convex/react";
import { useCallback, useState } from "react";
import { Loader2 } from "lucide-react";
import { api } from "@/convex/_generated/api";
import type { EventItem } from "@/lib/polymarket-events";
import { compactMarkets } from "./compact-markets";
import { isActiveStatus } from "./constants";
import { AnalyzeEmptyState } from "./empty-state";
import { AnalyzeLogsPanel } from "./logs-panel";
import { AnalyzeMarketPicks } from "./market-picks";
import { AnalyzeQuestionTimeline } from "./question-timeline";
import { AnalyzeResearchMemoCard } from "./research-memo-card";
import { AnalyzeRunHeader } from "./run-header";
import { AnalyzeSpeculativeNotice } from "./speculative-notice";
import { AnalyzeWorkflowErrorCard } from "./workflow-error-card";

export function AnalyzePanel({ event }: { event: EventItem }) {
  const eventSlug = event.slug ?? event.id;
  const currentUser = useQuery(api.users.getCurrentUser);
  const isAuthenticated = !!currentUser;
  const authLoading = currentUser === undefined;
  const latestRun = useQuery(api.research.queries.getLatestRun, { eventSlug });
  const startResearch = useMutation(api.research.api.startResearch);
  const cancelResearch = useMutation(api.research.api.cancelResearch);
  const [starting, setStarting] = useState(false);

  const runId = latestRun?._id;
  const questions = useQuery(
    api.research.queries.listQuestions,
    runId ? { runId } : "skip",
  );
  const picks = useQuery(
    api.research.queries.listMarketPicks,
    runId ? { runId } : "skip",
  );
  const logs = useQuery(
    api.research.queries.listLogs,
    runId ? { runId, limit: 120 } : "skip",
  );

  const handleStart = useCallback(async () => {
    if (!isAuthenticated) return;
    setStarting(true);
    try {
      const eventUrl = event.slug
        ? `https://polymarket.com/event/${event.slug}`
        : undefined;
      await startResearch({
        eventSlug,
        eventTitle: event.title,
        eventDescription: event.description,
        eventUrl,
        markets: compactMarkets(event.markets ?? []),
      });
    } finally {
      setStarting(false);
    }
  }, [event, eventSlug, startResearch, isAuthenticated]);

  const handleCancel = useCallback(async () => {
    if (!runId) return;
    await cancelResearch({ runId });
  }, [runId, cancelResearch]);

  if (latestRun === undefined || authLoading) {
    return (
      <div className="flex min-h-64 items-center justify-center rounded-lg border border-border/60 bg-muted/20 p-6">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!latestRun) {
    return (
      <AnalyzeEmptyState
        onStart={handleStart}
        starting={starting}
        isAuthenticated={isAuthenticated}
      />
    );
  }

  const active = isActiveStatus(latestRun.status);

  return (
    <div className="flex flex-col gap-6">
      <AnalyzeRunHeader
        status={latestRun.status}
        startedAt={latestRun.startedAt}
        completedAt={latestRun.completedAt}
        onStart={handleStart}
        onCancel={handleCancel}
        starting={starting}
        active={active}
        isAuthenticated={isAuthenticated}
      />

      {latestRun.status === "stopped_speculative" && (
        <AnalyzeSpeculativeNotice reason={latestRun.speculativeReason} />
      )}

      {latestRun.errorMessage && (
        <AnalyzeWorkflowErrorCard message={latestRun.errorMessage} />
      )}

      {latestRun.finalReport && (
        <AnalyzeResearchMemoCard markdown={latestRun.finalReport} />
      )}

      {picks && picks.length > 0 && (
        <AnalyzeMarketPicks picks={picks} markets={event.markets ?? []} />
      )}

      {questions && questions.length > 0 && (
        <AnalyzeQuestionTimeline questions={questions} active={active} />
      )}

      {logs && logs.length > 0 && <AnalyzeLogsPanel logs={logs} />}
    </div>
  );
}
