import { v } from "convex/values";
import { internalMutation } from "../_generated/server";

const runStatusValidator = v.union(
  v.literal("pending"),
  v.literal("classifying"),
  v.literal("planning"),
  v.literal("researching"),
  v.literal("consolidating"),
  v.literal("recommending"),
  v.literal("synthesizing"),
  v.literal("completed"),
  v.literal("stopped_speculative"),
  v.literal("failed"),
);

const questionStatusValidator = v.union(
  v.literal("pending"),
  v.literal("searching"),
  v.literal("scraping"),
  v.literal("summarizing"),
  v.literal("done"),
  v.literal("failed"),
);

const searchDecisionValidator = v.union(
  v.literal("pending"),
  v.literal("skip"),
  v.literal("scrape"),
  v.literal("scraped"),
  v.literal("scrape_failed"),
);

const sideValidator = v.union(
  v.literal("YES"),
  v.literal("NO"),
  v.literal("AVOID"),
  v.literal("WATCH"),
);

export const patchRun = internalMutation({
  args: {
    runId: v.id("researchRuns"),
    status: v.optional(runStatusValidator),
    isSpeculative: v.optional(v.boolean()),
    speculativeReason: v.optional(v.string()),
    planQuestions: v.optional(v.array(v.string())),
    finalReport: v.optional(v.string()),
    errorMessage: v.optional(v.string()),
    workflowId: v.optional(v.string()),
    completedAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { runId, ...rest } = args;
    const patch: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(rest)) {
      if (value !== undefined) patch[key] = value;
    }
    await ctx.db.patch(runId, patch);
  },
});

export const createQuestion = internalMutation({
  args: {
    runId: v.id("researchRuns"),
    question: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("researchQuestions", {
      runId: args.runId,
      question: args.question,
      status: "pending",
      iteration: 0,
    });
  },
});

export const patchQuestion = internalMutation({
  args: {
    questionId: v.id("researchQuestions"),
    status: v.optional(questionStatusValidator),
    iteration: v.optional(v.number()),
    consolidatedSummary: v.optional(v.string()),
    errorMessage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { questionId, ...rest } = args;
    const patch: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(rest)) {
      if (value !== undefined) patch[key] = value;
    }
    await ctx.db.patch(questionId, patch);
  },
});

export const insertSearchResults = internalMutation({
  args: {
    runId: v.id("researchRuns"),
    questionId: v.id("researchQuestions"),
    iteration: v.number(),
    results: v.array(
      v.object({
        url: v.string(),
        title: v.optional(v.string()),
        snippet: v.optional(v.string()),
        source: v.optional(v.string()),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const ids: string[] = [];
    for (const r of args.results) {
      const id = await ctx.db.insert("researchSearchResults", {
        runId: args.runId,
        questionId: args.questionId,
        iteration: args.iteration,
        url: r.url,
        title: r.title,
        snippet: r.snippet,
        source: r.source,
        decision: "pending",
      });
      ids.push(id);
    }
    return ids;
  },
});

export const patchSearchResult = internalMutation({
  args: {
    searchResultId: v.id("researchSearchResults"),
    decision: v.optional(searchDecisionValidator),
    decisionReason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { searchResultId, ...rest } = args;
    const patch: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(rest)) {
      if (value !== undefined) patch[key] = value;
    }
    await ctx.db.patch(searchResultId, patch);
  },
});

export const insertSource = internalMutation({
  args: {
    runId: v.id("researchRuns"),
    questionId: v.id("researchQuestions"),
    searchResultId: v.optional(v.id("researchSearchResults")),
    iteration: v.number(),
    url: v.string(),
    title: v.optional(v.string()),
    markdown: v.optional(v.string()),
    summary: v.optional(v.string()),
    relevant: v.boolean(),
    relevanceReason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("researchSources", {
      runId: args.runId,
      questionId: args.questionId,
      searchResultId: args.searchResultId,
      iteration: args.iteration,
      url: args.url,
      title: args.title,
      markdown: args.markdown,
      summary: args.summary,
      relevant: args.relevant,
      relevanceReason: args.relevanceReason,
    });
  },
});

export const insertMarketPick = internalMutation({
  args: {
    runId: v.id("researchRuns"),
    marketId: v.string(),
    marketQuestion: v.optional(v.string()),
    side: sideValidator,
    conviction: v.number(),
    rationale: v.string(),
    keyRisk: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("researchMarketPicks", {
      runId: args.runId,
      marketId: args.marketId,
      marketQuestion: args.marketQuestion,
      side: args.side,
      conviction: args.conviction,
      rationale: args.rationale,
      keyRisk: args.keyRisk,
    });
  },
});

export const log = internalMutation({
  args: {
    runId: v.id("researchRuns"),
    phase: v.string(),
    level: v.union(v.literal("info"), v.literal("warn"), v.literal("error")),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("researchLogs", {
      runId: args.runId,
      ts: Date.now(),
      phase: args.phase,
      level: args.level,
      message: args.message,
    });
  },
});
