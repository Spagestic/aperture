"use node";

import { v } from "convex/values";
import { z } from "zod";
import { internalAction } from "../_generated/server";
import { api, internal } from "../_generated/api";
import type { Doc, Id } from "../_generated/dataModel";
import {
  generateStructured,
  today,
  RESEARCH_BUDGET,
} from "./agent";

type SearchResultItem = {
  url: string;
  title?: string;
  snippet?: string;
  source?: string;
};

type FirecrawlSearchResponse = {
  success?: boolean;
  data?: {
    web?: Array<{ url?: string; title?: string; description?: string }>;
    news?: Array<{ url?: string; title?: string; description?: string }>;
  } & Record<string, unknown>;
};

function normalizeSearchResults(raw: unknown): SearchResultItem[] {
  const out: SearchResultItem[] = [];
  const r = raw as FirecrawlSearchResponse | undefined;
  const buckets: Array<["web" | "news", Array<{ url?: string; title?: string; description?: string }> | undefined]> = [
    ["web", r?.data?.web],
    ["news", r?.data?.news],
  ];
  for (const [source, bucket] of buckets) {
    if (!Array.isArray(bucket)) continue;
    for (const item of bucket) {
      if (!item?.url) continue;
      out.push({
        url: item.url,
        title: item.title,
        snippet: item.description,
        source,
      });
    }
  }
  return out;
}

function truncate(str: string | undefined, n: number): string {
  if (!str) return "";
  return str.length > n ? `${str.slice(0, n)}\n...[truncated]` : str;
}

export const runSubagent = internalAction({
  args: {
    runId: v.id("researchRuns"),
    questionId: v.id("researchQuestions"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const run = await ctx.runQuery(internal.research.queries.getRunInternal, {
      runId: args.runId,
    });
    const question = await ctx.runQuery(
      internal.research.queries.getQuestionInternal,
      { questionId: args.questionId },
    );
    if (!run || !question) throw new Error("Missing run or question");

    const eventTitle = run.eventTitle ?? "";
    const eventDescription = run.eventDescription ?? "";
    const eventContextText = `Event: ${eventTitle}\n${eventDescription ? `Description: ${eventDescription.slice(0, 1200)}\n` : ""}`;

    let currentQuery = question.question;
    let iteration = 0;
    let relevantCount = 0;
    const alreadyScraped = new Set<string>();

    try {
      while (
        iteration < RESEARCH_BUDGET.MAX_ITERATIONS_PER_QUESTION &&
        relevantCount < RESEARCH_BUDGET.RELEVANT_SOURCE_TARGET
      ) {
        iteration += 1;
        await ctx.runMutation(internal.research.mutations.patchQuestion, {
          questionId: args.questionId,
          status: "searching",
          iteration,
        });
        await ctx.runMutation(internal.research.mutations.log, {
          runId: args.runId,
          phase: `question:${iteration}:search`,
          level: "info",
          message: `Searching for: ${currentQuery}`,
        });

        let searchResponse: unknown;
        try {
          searchResponse = await ctx.runAction(api.firecrawl.search.search, {
            query: currentQuery,
            limit: RESEARCH_BUDGET.SEARCH_RESULTS_PER_ITERATION,
            sources: ["web"],
          });
        } catch (err) {
          await ctx.runMutation(internal.research.mutations.log, {
            runId: args.runId,
            phase: `question:${iteration}:search`,
            level: "error",
            message: `Search failed: ${String(err)}`,
          });
          break;
        }

        const rawResults = normalizeSearchResults(searchResponse);
        const freshResults = rawResults.filter(
          (r) => !alreadyScraped.has(r.url),
        );

        if (freshResults.length === 0) {
          await ctx.runMutation(internal.research.mutations.log, {
            runId: args.runId,
            phase: `question:${iteration}:search`,
            level: "warn",
            message: "No new search results.",
          });
          break;
        }

        const searchResultIds = (await ctx.runMutation(
          internal.research.mutations.insertSearchResults,
          {
            runId: args.runId,
            questionId: args.questionId,
            iteration,
            results: freshResults,
          },
        )) as Array<Id<"researchSearchResults">>;

        const judgeSchema = z.object({
          picks: z
            .array(
              z.object({
                index: z
                  .number()
                  .int()
                  .min(0)
                  .max(freshResults.length - 1),
                reason: z.string(),
              }),
            )
            .max(RESEARCH_BUDGET.MAX_SCRAPES_PER_ITERATION),
        });

        const judgePrompt = `Pick up to ${RESEARCH_BUDGET.MAX_SCRAPES_PER_ITERATION} search results that are most likely to contain evidence to answer the research question.

Question: ${question.question}
${eventContextText}
Today: ${today()}

Search results (choose by index):
${freshResults
  .map(
    (r, i) =>
      `[${i}] ${r.title ?? "(no title)"} (${r.source}) - ${r.url}\n    ${r.snippet ?? ""}`,
  )
  .join("\n")}`;

        const judged = await generateStructured({
          schema: judgeSchema,
          system:
            "You pick the most promising web sources to scrape for prediction-market research. Prefer primary sources, official data, and reputable reporting. Avoid clickbait and speculation.",
          prompt: judgePrompt,
          temperature: 0,
        });

        const pickedIndexes = new Set<number>();
        for (const p of judged.picks) {
          if (p.index >= 0 && p.index < freshResults.length) {
            pickedIndexes.add(p.index);
          }
        }

        for (let i = 0; i < freshResults.length; i++) {
          const sid = searchResultIds[i];
          if (pickedIndexes.has(i)) {
            const reason =
              judged.picks.find((p) => p.index === i)?.reason ?? "";
            await ctx.runMutation(internal.research.mutations.patchSearchResult, {
              searchResultId: sid,
              decision: "scrape",
              decisionReason: reason,
            });
          } else {
            await ctx.runMutation(internal.research.mutations.patchSearchResult, {
              searchResultId: sid,
              decision: "skip",
            });
          }
        }

        if (pickedIndexes.size === 0) {
          await ctx.runMutation(internal.research.mutations.log, {
            runId: args.runId,
            phase: `question:${iteration}:judge`,
            level: "warn",
            message: "LLM picked no results this iteration.",
          });
        }

        await ctx.runMutation(internal.research.mutations.patchQuestion, {
          questionId: args.questionId,
          status: "scraping",
        });

        const picked = Array.from(pickedIndexes).map((i) => ({
          result: freshResults[i],
          searchResultId: searchResultIds[i],
        }));

        const scrapeOutcomes = await Promise.all(
          picked.map(async ({ result, searchResultId }) => {
            alreadyScraped.add(result.url);
            try {
              const scraped = (await ctx.runAction(
                api.firecrawl.scrape.scrape,
                { url: result.url },
              )) as { markdown?: string };
              await ctx.runMutation(
                internal.research.mutations.patchSearchResult,
                {
                  searchResultId,
                  decision: "scraped",
                },
              );
              return {
                result,
                searchResultId,
                markdown: scraped.markdown ?? "",
              };
            } catch (err) {
              await ctx.runMutation(
                internal.research.mutations.patchSearchResult,
                {
                  searchResultId,
                  decision: "scrape_failed",
                  decisionReason: String(err).slice(0, 500),
                },
              );
              await ctx.runMutation(internal.research.mutations.log, {
                runId: args.runId,
                phase: `question:${iteration}:scrape`,
                level: "warn",
                message: `Scrape failed for ${result.url}: ${String(err).slice(0, 200)}`,
              });
              return null;
            }
          }),
        );

        const scraped = scrapeOutcomes.filter(
          (x): x is { result: SearchResultItem; searchResultId: Id<"researchSearchResults">; markdown: string } =>
            x !== null && !!x.markdown,
        );

        await ctx.runMutation(internal.research.mutations.patchQuestion, {
          questionId: args.questionId,
          status: "summarizing",
        });

        const summarizeSchema = z.object({
          summary: z.string(),
          relevant: z.boolean(),
          relevanceReason: z.string(),
        });

        await Promise.all(
          scraped.map(async (s) => {
            try {
              const out = await generateStructured({
                schema: summarizeSchema,
                system: `You are a research analyst. Summarize a web page's evidence relevant to a specific prediction-market research question.
- Focus only on evidence that changes the probability of the question.
- Cite specific facts, numbers, dates when possible.
- If the page does not contain relevant evidence, say so and mark relevant=false.
Today: ${today()}`,
                prompt: `Research question: ${question.question}
${eventContextText}

Source URL: ${s.result.url}
Source title: ${s.result.title ?? ""}

Page markdown:
"""
${truncate(s.markdown, 12000)}
"""

Return:
- summary: 3-8 sentence markdown summary of relevant evidence (empty/short if not relevant)
- relevant: boolean
- relevanceReason: 1-sentence justification`,
                temperature: 0,
              });

              await ctx.runMutation(internal.research.mutations.insertSource, {
                runId: args.runId,
                questionId: args.questionId,
                searchResultId: s.searchResultId,
                iteration,
                url: s.result.url,
                title: s.result.title,
                markdown: truncate(s.markdown, 20000),
                summary: out.summary,
                relevant: out.relevant,
                relevanceReason: out.relevanceReason,
              });
              if (out.relevant) relevantCount += 1;
            } catch (err) {
              await ctx.runMutation(internal.research.mutations.log, {
                runId: args.runId,
                phase: `question:${iteration}:summarize`,
                level: "warn",
                message: `Summarize failed for ${s.result.url}: ${String(err).slice(0, 200)}`,
              });
            }
          }),
        );

        await ctx.runMutation(internal.research.mutations.log, {
          runId: args.runId,
          phase: `question:${iteration}:done`,
          level: "info",
          message: `Iteration ${iteration} complete. Relevant sources so far: ${relevantCount}`,
        });

        if (relevantCount >= RESEARCH_BUDGET.RELEVANT_SOURCE_TARGET) break;
        if (iteration >= RESEARCH_BUDGET.MAX_ITERATIONS_PER_QUESTION) break;

        const followupSchema = z.object({
          nextQuery: z.string().min(3),
          reason: z.string(),
        });
        const existingRelevant = (await ctx.runQuery(
          internal.research.queries.listRelevantSourcesInternal,
          { questionId: args.questionId },
        )) as Array<Doc<"researchSources">>;
        const followup = await generateStructured({
          schema: followupSchema,
          system:
            "You refine a web search query when previous searches did not yield enough relevant evidence. Propose a distinct, more targeted query. Avoid repeating the original verbatim.",
          prompt: `Research question: ${question.question}
Original query: ${question.question}
Last query attempted: ${currentQuery}
Relevant sources found so far: ${existingRelevant.length}

Produce a refined search query for the next iteration.`,
          temperature: 0.3,
        });
        currentQuery = followup.nextQuery;
      }

      const relevantSources = (await ctx.runQuery(
        internal.research.queries.listRelevantSourcesInternal,
        { questionId: args.questionId },
      )) as Array<Doc<"researchSources">>;

      if (relevantSources.length === 0) {
        await ctx.runMutation(internal.research.mutations.patchQuestion, {
          questionId: args.questionId,
          status: "done",
          consolidatedSummary:
            "No sufficiently relevant public sources were found for this question after the allotted iterations.",
        });
        return null;
      }

      const consolidatedSchema = z.object({
        summary: z.string(),
      });
      const consolidated = await generateStructured({
        schema: consolidatedSchema,
        system: `You consolidate multiple source summaries into a single evidence-based answer to a research question.
- Use markdown.
- Group by theme when helpful.
- Cite URLs inline where useful.
- Call out contradictions explicitly.
- Stay factual; no speculation.`,
        prompt: `Research question: ${question.question}
${eventContextText}

Relevant source summaries:
${relevantSources
  .map(
    (s, i) =>
      `[${i + 1}] ${s.title ?? s.url}\nURL: ${s.url}\nSummary: ${s.summary ?? ""}\n`,
  )
  .join("\n")}

Write a focused markdown answer to the research question grounded in these sources.`,
        temperature: 0.1,
      });

      await ctx.runMutation(internal.research.mutations.patchQuestion, {
        questionId: args.questionId,
        status: "done",
        consolidatedSummary: consolidated.summary,
      });
    } catch (err) {
      await ctx.runMutation(internal.research.mutations.patchQuestion, {
        questionId: args.questionId,
        status: "failed",
        errorMessage: String(err).slice(0, 500),
      });
      await ctx.runMutation(internal.research.mutations.log, {
        runId: args.runId,
        phase: "question:error",
        level: "error",
        message: `Subagent failed: ${String(err).slice(0, 500)}`,
      });
    }
    return null;
  },
});
