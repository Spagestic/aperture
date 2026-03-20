import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const create = mutation({
  args: {
    companyId: v.id("companies"),
    type: v.string(),
    title: v.string(),
    pdfUrl: v.string(),
    publishedDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("documents", {
      ...args,
      status: "pending",
    });
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
  },
  handler: async (ctx, args) => {
    const { documentId, ...updates } = args;
    await ctx.db.patch(documentId, updates);
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
