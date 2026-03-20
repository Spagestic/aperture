import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const create = mutation({
  args: {
    ticker: v.string(),
    name: v.string(),
    exchange: v.string(),
    websiteUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if company already exists
    const existing = await ctx.db
      .query("companies")
      .withIndex("by_ticker", (q) => q.eq("ticker", args.ticker))
      .first();

    if (existing) {
      return existing._id;
    }

    return await ctx.db.insert("companies", args);
  },
});

export const getByTicker = query({
  args: { ticker: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("companies")
      .withIndex("by_ticker", (q) => q.eq("ticker", args.ticker))
      .first();
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("companies").collect();
  },
});
