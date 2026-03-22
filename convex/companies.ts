import { v } from "convex/values";
import { Doc } from "./_generated/dataModel";
import { internalMutation, mutation, query } from "./_generated/server";

export const create = mutation({
  args: {
    ticker: v.string(),
    name: v.string(),
    exchange: v.string(),
    websiteUrl: v.optional(v.string()),
    country: v.optional(v.string()),
    sector: v.optional(v.string()),
    industry: v.optional(v.string()),
    currency: v.optional(v.string()),
    listedBoard: v.optional(v.string()),
    description: v.optional(v.string()),
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

export const patch = mutation({
  args: {
    companyId: v.id("companies"),
    websiteUrl: v.optional(v.string()),
    country: v.optional(v.string()),
    sector: v.optional(v.string()),
    industry: v.optional(v.string()),
    currency: v.optional(v.string()),
    listedBoard: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { companyId, ...u } = args;
    const updates: Partial<
      Pick<
        Doc<"companies">,
        | "websiteUrl"
        | "country"
        | "sector"
        | "industry"
        | "currency"
        | "listedBoard"
        | "description"
      >
    > = {};
    if (u.websiteUrl !== undefined) updates.websiteUrl = u.websiteUrl;
    if (u.country !== undefined) updates.country = u.country;
    if (u.sector !== undefined) updates.sector = u.sector;
    if (u.industry !== undefined) updates.industry = u.industry;
    if (u.currency !== undefined) updates.currency = u.currency;
    if (u.listedBoard !== undefined) updates.listedBoard = u.listedBoard;
    if (u.description !== undefined) updates.description = u.description;
    if (Object.keys(updates).length === 0) {
      return;
    }
    await ctx.db.patch(companyId, updates);
  },
});

/** Recompute `latestFilingDate` from all documents for this company (max publishedDate). */
export const refreshLatestFilingDate = internalMutation({
  args: { companyId: v.id("companies") },
  handler: async (ctx, args) => {
    const docs = await ctx.db
      .query("documents")
      .withIndex("by_company", (q) => q.eq("companyId", args.companyId))
      .collect();

    let bestIso: string | undefined;
    for (const d of docs) {
      if (!d.publishedDate) continue;
      if (!bestIso || d.publishedDate > bestIso) {
        bestIso = d.publishedDate;
      }
    }

    const latestDay = bestIso ? bestIso.slice(0, 10) : undefined;
    const company = await ctx.db.get(args.companyId);
    if (!company) {
      return;
    }

    if (company.latestFilingDate === latestDay) {
      return;
    }

    await ctx.db.patch(args.companyId, { latestFilingDate: latestDay });
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
