import { v } from "convex/values";
import { internal } from "./_generated/api";
import { mutation, query } from "./_generated/server";

export const create = mutation({
  args: {
    companyId: v.id("companies"),
    type: v.union(
      v.literal("Annual Report"),
      v.literal("Interim Report"),
      v.literal("Announcement"),
      v.literal("Press Release"),
      v.literal("Other"),
    ),
    title: v.string(),
    pdfUrl: v.string(),
    publishedDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("documents", {
      ...args,
      status: "pending",
    });
    await ctx.runMutation(internal.companies.refreshLatestFilingDate, {
      companyId: args.companyId,
    });
    return id;
  },
});

export const updateStatus = mutation({
  args: {
    documentId: v.id("documents"),
    status: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("completed"),
      v.literal("failed"),
    ),
    markdownContent: v.optional(v.string()),
    title: v.optional(v.string()),
    type: v.optional(
      v.union(
        v.literal("Annual Report"),
        v.literal("Interim Report"),
        v.literal("Announcement"),
        v.literal("Press Release"),
        v.literal("Other"),
      ),
    ),
    publishedDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { documentId, ...updates } = args;
    await ctx.db.patch(documentId, updates);
    const doc = await ctx.db.get(documentId);
    if (doc) {
      await ctx.runMutation(internal.companies.refreshLatestFilingDate, {
        companyId: doc.companyId,
      });
    }
  },
});

export const getDocument = query({
  args: { documentId: v.id("documents") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.documentId);
  },
});

export const listByCompany = query({
  args: { companyId: v.id("companies") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("documents")
      .withIndex("by_company", (q) => q.eq("companyId", args.companyId))
      .collect();
  },
});

export const listByTicker = query({
  args: { ticker: v.string() },
  handler: async (ctx, args) => {
    const company = await ctx.db
      .query("companies")
      .withIndex("by_ticker", (q) => q.eq("ticker", args.ticker))
      .first();

    if (!company) {
      return [];
    }

    return await ctx.db
      .query("documents")
      .withIndex("by_company", (q) => q.eq("companyId", company._id))
      .order("desc")
      .collect();
  },
});

export const getPendingDocuments = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const q = ctx.db
      .query("documents")
      .withIndex("by_status", (q) => q.eq("status", "pending"));

    if (args.limit) {
      return await q.take(args.limit);
    }
    return await q.collect();
  },
});
