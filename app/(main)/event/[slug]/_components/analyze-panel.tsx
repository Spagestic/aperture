"use client";

import { useMutation, useQuery } from "convex/react";
import { useCallback, useMemo, useState } from "react";
import { Streamdown } from "streamdown";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Loader2,
  Search,
  Sparkles,
} from "lucide-react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import type { EventItem, Market } from "@/lib/polymarket-events";

type CompactMarket = {
  id: string;
  question?: string;
  outcomes?: Market["outcomes"];
  outcomePrices?: Market["outcomePrices"];
  endDate?: string;
  liquidity?: Market["liquidity"];
  volume24hr?: Market["volume24hr"];
  lastTradePrice?: Market["lastTradePrice"];
  bestBid?: Market["bestBid"];
  bestAsk?: Market["bestAsk"];
};

function compactMarkets(markets: Market[]): CompactMarket[] {
  return markets.slice(0, 24).map((m) => ({
    id: String(m.id),
    question: m.question,
    outcomes: m.outcomes,
    outcomePrices: m.outcomePrices,
    endDate: m.endDate,
    liquidity: m.liquidity,
    volume24hr: m.volume24hr,
    lastTradePrice: m.lastTradePrice,
    bestBid: m.bestBid,
    bestAsk: m.bestAsk,
  }));
}

const STATUS_LABEL: Record<string, string> = {
  pending: "Starting",
  classifying: "Classifying",
  planning: "Planning questions",
  researching: "Researching",
  consolidating: "Consolidating",
  recommending: "Picking markets",
  synthesizing: "Writing report",
  completed: "Completed",
  stopped_speculative: "Stopped (speculative)",
  failed: "Failed",
};

const STATUS_VARIANT: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  pending: "outline",
  classifying: "secondary",
  planning: "secondary",
  researching: "secondary",
  consolidating: "secondary",
  recommending: "secondary",
  synthesizing: "secondary",
  completed: "default",
  stopped_speculative: "outline",
  failed: "destructive",
};

const SIDE_CLASS: Record<string, string> = {
  YES: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  NO: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30",
  AVOID: "bg-muted text-muted-foreground border-border",
  WATCH: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
};

function isActiveStatus(status?: string) {
  if (!status) return false;
  return [
    "pending",
    "classifying",
    "planning",
    "researching",
    "consolidating",
    "recommending",
    "synthesizing",
  ].includes(status);
}

export function AnalyzePanel({ event }: { event: EventItem }) {
  const eventSlug = event.slug ?? event.id;
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
  }, [event, eventSlug, startResearch]);

  const handleCancel = useCallback(async () => {
    if (!runId) return;
    await cancelResearch({ runId });
  }, [runId, cancelResearch]);

  if (latestRun === undefined) {
    return (
      <div className="flex min-h-64 items-center justify-center rounded-lg border border-border/60 bg-muted/20 p-6">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!latestRun) {
    return <EmptyState onStart={handleStart} starting={starting} />;
  }

  const active = isActiveStatus(latestRun.status);

  return (
    <div className="flex flex-col gap-6">
      <RunHeader
        status={latestRun.status}
        startedAt={latestRun.startedAt}
        completedAt={latestRun.completedAt}
        onStart={handleStart}
        onCancel={handleCancel}
        starting={starting}
        active={active}
      />

      {latestRun.status === "stopped_speculative" && (
        <SpeculativeNotice reason={latestRun.speculativeReason} />
      )}

      {latestRun.errorMessage && (
        <Card className="border-destructive/40">
          <CardContent className="flex items-start gap-3 pt-6">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
            <div>
              <p className="text-sm font-semibold text-destructive">
                Workflow error
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {latestRun.errorMessage}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {latestRun.finalReport && (
        <Card className="border-border/70">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="h-4 w-4 text-amber-500" />
              Research memo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm prose-neutral dark:prose-invert max-w-none">
              <Streamdown>{latestRun.finalReport}</Streamdown>
            </div>
          </CardContent>
        </Card>
      )}

      {picks && picks.length > 0 && (
        <MarketPicks picks={picks} markets={event.markets ?? []} />
      )}

      {questions && questions.length > 0 && (
        <QuestionTimeline
          runId={runId!}
          questions={questions}
          active={active}
        />
      )}

      {logs && logs.length > 0 && <LogsPanel logs={logs} />}
    </div>
  );
}

function EmptyState({
  onStart,
  starting,
}: {
  onStart: () => void;
  starting: boolean;
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
      <Button size="lg" onClick={onStart} disabled={starting}>
        {starting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Starting…
          </>
        ) : (
          "Start analysis"
        )}
      </Button>
    </div>
  );
}

function RunHeader({
  status,
  startedAt,
  completedAt,
  onStart,
  onCancel,
  starting,
  active,
}: {
  status: string;
  startedAt: number;
  completedAt?: number;
  onStart: () => void;
  onCancel: () => void;
  starting: boolean;
  active: boolean;
}) {
  const label = STATUS_LABEL[status] ?? status;
  const variant = STATUS_VARIANT[status] ?? "secondary";
  const duration = completedAt ? completedAt - startedAt : Date.now() - startedAt;
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
        ) : (
          <Button size="sm" onClick={onStart} disabled={starting}>
            {starting ? (
              <>
                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> Starting…
              </>
            ) : (
              "Re-run analysis"
            )}
          </Button>
        )}
      </div>
    </div>
  );
}

function SpeculativeNotice({ reason }: { reason?: string }) {
  return (
    <Card className="border-amber-500/40">
      <CardContent className="flex items-start gap-3 pt-6">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
        <div>
          <p className="text-sm font-semibold">This event looks speculative</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {reason ?? "The classifier judged it not researchable with public sources."}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function MarketPicks({
  picks,
  markets,
}: {
  picks: Array<{
    _id: Id<"researchMarketPicks">;
    marketId: string;
    marketQuestion?: string;
    side: string;
    conviction: number;
    rationale: string;
    keyRisk: string;
  }>;
  markets: Market[];
}) {
  const byId = useMemo(() => {
    const m = new Map<string, Market>();
    for (const mkt of markets) m.set(String(mkt.id), mkt);
    return m;
  }, [markets]);

  return (
    <Card className="border-border/70">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Recommended markets</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3">
        {picks.map((p) => {
          const mkt = byId.get(p.marketId);
          const question = mkt?.question ?? p.marketQuestion ?? p.marketId;
          return (
            <div
              key={p._id}
              className="rounded-lg border border-border/60 bg-background/40 p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <p className="max-w-2xl text-sm font-medium text-foreground">
                  {question}
                </p>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={cn("border", SIDE_CLASS[p.side])}
                  >
                    {p.side}
                  </Badge>
                  <Badge variant="secondary" className="font-mono">
                    conviction {p.conviction}
                  </Badge>
                </div>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">Why:</span>{" "}
                {p.rationale}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">Risk:</span>{" "}
                {p.keyRisk}
              </p>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

function QuestionTimeline({
  runId: _runId,
  questions,
  active,
}: {
  runId: Id<"researchRuns">;
  questions: Array<{
    _id: Id<"researchQuestions">;
    question: string;
    status: string;
    iteration: number;
    consolidatedSummary?: string;
    errorMessage?: string;
  }>;
  active: boolean;
}) {
  return (
    <Card className="border-border/70">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Research questions</CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" className="w-full">
          {questions.map((q, i) => (
            <QuestionRow key={q._id} index={i + 1} question={q} active={active} />
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}

function QuestionRow({
  index,
  question,
  active,
}: {
  index: number;
  question: {
    _id: Id<"researchQuestions">;
    question: string;
    status: string;
    iteration: number;
    consolidatedSummary?: string;
    errorMessage?: string;
  };
  active: boolean;
}) {
  const sources = useQuery(api.research.queries.listSourcesForQuestion, {
    questionId: question._id,
  });
  const searchResults = useQuery(
    api.research.queries.listSearchResultsForQuestion,
    { questionId: question._id },
  );

  const running = active && question.status !== "done" && question.status !== "failed";
  const statusLabel = (() => {
    switch (question.status) {
      case "pending":
        return "Queued";
      case "searching":
        return `Searching · iter ${question.iteration}`;
      case "scraping":
        return `Scraping · iter ${question.iteration}`;
      case "summarizing":
        return `Summarizing · iter ${question.iteration}`;
      case "done":
        return "Done";
      case "failed":
        return "Failed";
      default:
        return question.status;
    }
  })();

  return (
    <AccordionItem value={question._id}>
      <AccordionTrigger className="gap-3 text-left">
        <div className="flex flex-1 items-start gap-3">
          <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-foreground">
            {index}
          </span>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">
              {question.question}
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <Badge
                variant={question.status === "failed" ? "destructive" : "secondary"}
                className="gap-1"
              >
                {running && <Loader2 className="h-3 w-3 animate-spin" />}
                {statusLabel}
              </Badge>
              {sources && (
                <span className="text-xs text-muted-foreground">
                  {sources.filter((s) => s.relevant).length} relevant ·{" "}
                  {sources.length} scraped
                </span>
              )}
            </div>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="space-y-4">
        {question.consolidatedSummary && (
          <div className="prose prose-sm prose-neutral dark:prose-invert max-w-none rounded-md border border-border/60 bg-muted/30 p-3">
            <Streamdown>{question.consolidatedSummary}</Streamdown>
          </div>
        )}
        {sources && sources.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Sources
            </p>
            {sources.map((s) => (
              <div
                key={s._id}
                className="rounded-md border border-border/50 bg-background/40 p-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 text-xs font-medium text-foreground hover:underline"
                  >
                    {s.title ?? s.url}
                    <ExternalLink className="ml-1 inline h-3 w-3 text-muted-foreground" />
                  </a>
                  <Badge
                    variant={s.relevant ? "default" : "outline"}
                    className="shrink-0 text-[10px]"
                  >
                    {s.relevant ? "relevant" : "not relevant"}
                  </Badge>
                </div>
                {s.summary && (
                  <p className="mt-2 whitespace-pre-wrap text-xs text-muted-foreground">
                    {s.summary}
                  </p>
                )}
                {s.relevanceReason && !s.relevant && (
                  <p className="mt-1 text-[11px] italic text-muted-foreground">
                    {s.relevanceReason}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
        {searchResults && searchResults.length > 0 && (
          <details className="rounded-md border border-border/40 bg-muted/10 p-3 text-xs">
            <summary className="cursor-pointer text-muted-foreground">
              <Search className="mr-1 inline h-3 w-3" /> All search results (
              {searchResults.length})
            </summary>
            <ul className="mt-2 space-y-1">
              {searchResults.map((r) => (
                <li key={r._id} className="flex items-start gap-2">
                  <Badge
                    variant="outline"
                    className="shrink-0 text-[10px] capitalize"
                  >
                    {r.decision}
                  </Badge>
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noreferrer"
                    className="truncate text-muted-foreground hover:text-foreground"
                  >
                    {r.title ?? r.url}
                  </a>
                </li>
              ))}
            </ul>
          </details>
        )}
        {question.errorMessage && (
          <p className="text-xs text-destructive">{question.errorMessage}</p>
        )}
      </AccordionContent>
    </AccordionItem>
  );
}

function LogsPanel({
  logs,
}: {
  logs: Array<{
    _id: string;
    ts: number;
    phase: string;
    level: string;
    message: string;
  }>;
}) {
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
