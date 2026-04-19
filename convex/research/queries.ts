import { v } from "convex/values";
import { internalQuery, query, type QueryCtx } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

import { getAuthUserId } from "@convex-dev/auth/server";

async function loadLatestRunForEvent(ctx: QueryCtx, eventSlug: string) {
  return await ctx.db
    .query("researchRuns")
    .withIndex("by_event_slug", (q) => q.eq("eventSlug", eventSlug))
    .order("desc")
    .first();
}

export const getUserHistory = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("researchRuns")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(10);
  },
});

export const getLatestRun = query({
  args: { eventSlug: v.string() },
  handler: async (ctx, args) => {
    return await loadLatestRunForEvent(ctx, args.eventSlug);
  },
});

export const getRun = query({
  args: { runId: v.id("researchRuns") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.runId);
  },
});

export const listQuestions = query({
  args: { runId: v.id("researchRuns") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("researchQuestions")
      .withIndex("by_run", (q) => q.eq("runId", args.runId))
      .collect();
  },
});

export const listSourcesForQuestion = query({
  args: { questionId: v.id("researchQuestions") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("researchSources")
      .withIndex("by_question", (q) => q.eq("questionId", args.questionId))
      .collect();
  },
});

export const listSearchResultsForQuestion = query({
  args: { questionId: v.id("researchQuestions") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("researchSearchResults")
      .withIndex("by_question", (q) => q.eq("questionId", args.questionId))
      .collect();
  },
});

export const listMarketPicks = query({
  args: { runId: v.id("researchRuns") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("researchMarketPicks")
      .withIndex("by_run", (q) => q.eq("runId", args.runId))
      .order("desc")
      .collect();
  },
});

export const listLogs = query({
  args: { runId: v.id("researchRuns"), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const logs = await ctx.db
      .query("researchLogs")
      .withIndex("by_run", (q) => q.eq("runId", args.runId))
      .order("desc")
      .take(args.limit ?? 100);
    return logs.reverse();
  },
});

export const getRunInternal = internalQuery({
  args: { runId: v.id("researchRuns") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.runId);
  },
});

export const getQuestionInternal = internalQuery({
  args: { questionId: v.id("researchQuestions") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.questionId);
  },
});

export const listQuestionsInternal = internalQuery({
  args: { runId: v.id("researchRuns") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("researchQuestions")
      .withIndex("by_run", (q) => q.eq("runId", args.runId))
      .collect();
  },
});

export const listRelevantSourcesInternal = internalQuery({
  args: { questionId: v.id("researchQuestions") },
  handler: async (ctx, args) => {
    const sources = await ctx.db
      .query("researchSources")
      .withIndex("by_question", (q) => q.eq("questionId", args.questionId))
      .collect();
    return sources.filter((s) => s.relevant);
  },
});

export const listMarketPicksInternal = internalQuery({
  args: { runId: v.id("researchRuns") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("researchMarketPicks")
      .withIndex("by_run", (q) => q.eq("runId", args.runId))
      .collect();
  },
});

export const listScrapedUrlsForQuestionInternal = internalQuery({
  args: { questionId: v.id("researchQuestions") },
  handler: async (ctx, args) => {
    const results = await ctx.db
      .query("researchSearchResults")
      .withIndex("by_question", (q) => q.eq("questionId", args.questionId))
      .collect();
    const urls: string[] = [];
    for (const r of results) {
      if (r.decision === "scraped" || r.decision === "scrape") {
        urls.push(r.url);
      }
    }
    return urls;
  },
});

export type RunDoc = NonNullable<
  Awaited<ReturnType<typeof loadLatestRunForEvent>>
>;
export type { Id };
