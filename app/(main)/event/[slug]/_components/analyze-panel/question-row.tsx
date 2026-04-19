"use client";

import { useQuery } from "convex/react";
import { ExternalLink, Loader2, Search } from "lucide-react";
import { Streamdown } from "streamdown";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

export type QuestionRowData = {
  _id: Id<"researchQuestions">;
  question: string;
  status: string;
  iteration: number;
  consolidatedSummary?: string;
  errorMessage?: string;
};

export function AnalyzeQuestionRow({
  index,
  question,
  active,
}: {
  index: number;
  question: QuestionRowData;
  active: boolean;
}) {
  const sources = useQuery(api.research.queries.listSourcesForQuestion, {
    questionId: question._id,
  });
  const searchResults = useQuery(
    api.research.queries.listSearchResultsForQuestion,
    { questionId: question._id },
  );

  const running =
    active && question.status !== "done" && question.status !== "failed";
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
                variant={
                  question.status === "failed" ? "destructive" : "secondary"
                }
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
