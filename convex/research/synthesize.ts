"use node";

import { v } from "convex/values";
import { z } from "zod";
import { internalAction, type ActionCtx } from "../_generated/server";
import { internal } from "../_generated/api";
import type { Doc, Id } from "../_generated/dataModel";
import { generateStructured, generateMarkdown, today } from "./agent";

type CompactMarket = {
  id: string;
  question?: string;
  outcomes?: unknown;
  outcomePrices?: unknown;
  endDate?: string;
  liquidity?: unknown;
  volume24hr?: unknown;
  lastTradePrice?: unknown;
  bestBid?: unknown;
  bestAsk?: unknown;
};

function parseCompactMarkets(marketsJson: string | undefined): CompactMarket[] {
  if (!marketsJson) return [];
  try {
    const parsed = JSON.parse(marketsJson) as CompactMarket[];
    if (!Array.isArray(parsed)) return [];
    return parsed.slice(0, 24).map((m) => ({
      id: String(m.id ?? ""),
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
  } catch {
    return [];
  }
}

async function loadQuestionSummaries(
  ctx: ActionCtx,
  runId: Id<"researchRuns">,
): Promise<
  Array<{
    question: string;
    status: string;
    consolidatedSummary: string;
  }>
> {
  const questions = (await ctx.runQuery(
    internal.research.queries.listQuestionsInternal,
    { runId },
  )) as Array<Doc<"researchQuestions">>;
  return questions.map((q) => ({
    question: q.question,
    status: q.status,
    consolidatedSummary: q.consolidatedSummary ?? "",
  }));
}

export const pickMarkets = internalAction({
  args: { runId: v.id("researchRuns") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.runMutation(internal.research.mutations.patchRun, {
      runId: args.runId,
      status: "recommending",
    });

    const run = await ctx.runQuery(internal.research.queries.getRunInternal, {
      runId: args.runId,
    });
    if (!run) throw new Error("Run not found");

    const compactMarkets = parseCompactMarkets(run.eventMarketsJson);
    if (compactMarkets.length === 0) {
      await ctx.runMutation(internal.research.mutations.log, {
        runId: args.runId,
        phase: "recommend",
        level: "warn",
        message: "No markets available for this event; skipping picks.",
      });
      return null;
    }

    const summaries = await loadQuestionSummaries(ctx, args.runId);

    const schema = z.object({
      picks: z
        .array(
          z.object({
            marketId: z.string(),
            marketQuestion: z.string().optional(),
            side: z.enum(["YES", "NO", "AVOID", "WATCH"]),
            conviction: z.number().int().min(0).max(100),
            rationale: z.string(),
            keyRisk: z.string(),
          }),
        )
        .max(8),
    });

    const prompt = `You are a prediction-market portfolio selector.
Today is ${today()}.

Event: ${run.eventTitle ?? ""}
${run.eventDescription ? `Description: ${run.eventDescription.slice(0, 1500)}\n` : ""}
Markets (only pick from these, use the exact marketId):
${compactMarkets
  .map(
    (m) =>
      `- id=${m.id} | q=${m.question ?? "(no question)"} | prices=${JSON.stringify(m.outcomePrices ?? null)} | endDate=${m.endDate ?? "?"} | vol24h=${String(m.volume24hr ?? "?")} | liq=${String(m.liquidity ?? "?")}`,
  )
  .join("\n")}

Research findings:
${summaries
  .map(
    (s, i) =>
      `Q${i + 1}: ${s.question}\nStatus: ${s.status}\nSummary:\n${s.consolidatedSummary}`,
  )
  .join("\n\n")}

Rules:
- Only use marketIds from the list above; do not invent markets.
- For each selected market choose a side: YES (edge on yes), NO (edge on no), AVOID (relevant but insufficient edge), WATCH (monitor).
- Conviction 0-100 reflects strength of evidence edge, not certainty.
- Be selective; weak setups should be AVOID or WATCH.
- Keep rationale and keyRisk to 1-2 sentences each.
Return up to 8 picks.`;

    const out = await generateStructured({
      schema,
      system:
        "You select prediction-market bets based only on the research findings provided. You never invent markets. You never hallucinate evidence.",
      prompt,
      temperature: 0.1,
    });

    const validIds = new Set(compactMarkets.map((m) => m.id));
    for (const pick of out.picks) {
      if (!validIds.has(pick.marketId)) continue;
      await ctx.runMutation(internal.research.mutations.insertMarketPick, {
        runId: args.runId,
        marketId: pick.marketId,
        marketQuestion: pick.marketQuestion,
        side: pick.side,
        conviction: pick.conviction,
        rationale: pick.rationale,
        keyRisk: pick.keyRisk,
      });
    }

    await ctx.runMutation(internal.research.mutations.log, {
      runId: args.runId,
      phase: "recommend",
      level: "info",
      message: `Produced ${out.picks.length} market picks.`,
    });

    return null;
  },
});

export const synthesizeFinal = internalAction({
  args: { runId: v.id("researchRuns") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.runMutation(internal.research.mutations.patchRun, {
      runId: args.runId,
      status: "synthesizing",
    });

    const run = await ctx.runQuery(internal.research.queries.getRunInternal, {
      runId: args.runId,
    });
    if (!run) throw new Error("Run not found");

    const summaries = await loadQuestionSummaries(ctx, args.runId);
    const picks = (await ctx.runQuery(
      internal.research.queries.listMarketPicksInternal,
      { runId: args.runId },
    )) as Array<Doc<"researchMarketPicks">>;

    const prompt = `Synthesize a final prediction-market research memo in markdown.

Event: ${run.eventTitle ?? ""}
${run.eventUrl ? `URL: ${run.eventUrl}\n` : ""}
${run.eventDescription ? `Description: ${run.eventDescription.slice(0, 1500)}\n` : ""}

Speculative classification:
- isSpeculative: ${run.isSpeculative === true}
- reason: ${run.speculativeReason ?? ""}

Research findings (per supervisor question):
${summaries
  .map(
    (s, i) =>
      `### Q${i + 1}: ${s.question}\nStatus: ${s.status}\n\n${s.consolidatedSummary}`,
  )
  .join("\n\n")}

Market picks:
${picks
  .map(
    (p) =>
      `- market=${p.marketId} | side=${p.side} | conviction=${p.conviction}\n  rationale: ${p.rationale}\n  risk: ${p.keyRisk}`,
  )
  .join("\n")}

Produce markdown with these sections:
1) Event understanding
2) Key evidence (group by question; include contradictions)
3) What matters most for resolution
4) Forecast
   - directional view
   - rough probability / confidence range
   - major uncertainty drivers
5) Recommended markets and sides (rank by attractiveness; reference marketIds)
6) What to monitor next

Be explicit about evidence quality and where uncertainty is high. Do not invent facts.`;

    const markdown = await generateMarkdown({
      system: `You are an expert Polymarket-style prediction-market analyst.
Today is ${today()}.
You synthesize the research memo strictly from the provided context. Do not fabricate sources or numbers.`,
      prompt,
      temperature: 0.2,
    });

    await ctx.runMutation(internal.research.mutations.patchRun, {
      runId: args.runId,
      finalReport: markdown,
      status: "completed",
      completedAt: Date.now(),
    });
    await ctx.runMutation(internal.research.mutations.log, {
      runId: args.runId,
      phase: "synthesize",
      level: "info",
      message: "Final report generated.",
    });
    return null;
  },
});
