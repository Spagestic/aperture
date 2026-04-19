import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { internal } from "../_generated/api";
import { workflow } from "./workflow";
import { getAuthUserId } from "@convex-dev/auth/server";
import type { Id } from "../_generated/dataModel";

const compactMarketValidator = v.object({
  id: v.string(),
  question: v.optional(v.string()),
  outcomes: v.optional(v.any()),
  outcomePrices: v.optional(v.any()),
  endDate: v.optional(v.string()),
  liquidity: v.optional(v.any()),
  volume24hr: v.optional(v.any()),
  lastTradePrice: v.optional(v.any()),
  bestBid: v.optional(v.any()),
  bestAsk: v.optional(v.any()),
});

export const startResearch = mutation({
  args: {
    eventSlug: v.string(),
    eventTitle: v.optional(v.string()),
    eventDescription: v.optional(v.string()),
    eventUrl: v.optional(v.string()),
    markets: v.optional(v.array(compactMarketValidator)),
  },
  returns: v.object({
    runId: v.id("researchRuns"),
    workflowId: v.string(),
  }),
  handler: async (
    ctx,
    args,
  ): Promise<{ runId: Id<"researchRuns">; workflowId: string }> => {
    const userId = await getAuthUserId(ctx);
    const marketsJson = args.markets ? JSON.stringify(args.markets) : undefined;

    const runId: Id<"researchRuns"> = await ctx.db.insert("researchRuns", {
      eventSlug: args.eventSlug,
      eventTitle: args.eventTitle,
      eventDescription: args.eventDescription,
      eventUrl: args.eventUrl,
      eventMarketsJson: marketsJson,
      userId: userId ?? undefined,
      status: "pending",
      startedAt: Date.now(),
    });

    const workflowId: string = await workflow.start(
      ctx,
      internal.research.workflow.researchEvent,
      { runId },
    );

    await ctx.db.patch(runId, { workflowId });

    return { runId, workflowId };
  },
});

export const cancelResearch = mutation({
  args: { runId: v.id("researchRuns") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const run = await ctx.db.get(args.runId);
    if (!run || !run.workflowId) return null;
    try {
      await workflow.cancel(
        ctx,
        run.workflowId as Parameters<typeof workflow.cancel>[1],
      );
    } catch {
      // best-effort cancellation; workflow may already be complete
    }
    await ctx.db.patch(args.runId, {
      status: "failed",
      errorMessage: "Canceled by user",
      completedAt: Date.now(),
    });
    return null;
  },
});
