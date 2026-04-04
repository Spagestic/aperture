import { v } from "convex/values";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import {
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";

const documentTypeValidator = v.union(
  v.literal("Annual Report"),
  v.literal("Interim Report"),
  v.literal("Announcement"),
  v.literal("Press Release"),
  v.literal("Other"),
);

export const latestJobByTicker = query({
  args: { ticker: v.string() },
  handler: async (ctx, args) => {
    const company = await ctx.db
      .query("companies")
      .withIndex("by_ticker", (q) => q.eq("ticker", args.ticker))
      .first();
    if (!company) {
      return null;
    }
    return await ctx.db
      .query("documentDiscoveryJobs")
      .withIndex("by_company", (q) => q.eq("companyId", company._id))
      .order("desc")
      .first();
  },
});

export const getJob = internalQuery({
  args: { jobId: v.id("documentDiscoveryJobs") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.jobId);
  },
});

export const getPendingCandidates = internalQuery({
  args: {
    jobId: v.id("documentDiscoveryJobs"),
    limit: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("discoveryLinkCandidates")
      .withIndex("by_job_and_state", (q) =>
        q.eq("jobId", args.jobId).eq("state", "pending"),
      )
      .take(args.limit);
  },
});

export const countPendingCandidates = internalQuery({
  args: { jobId: v.id("documentDiscoveryJobs") },
  handler: async (ctx, args) => {
    const pending = await ctx.db
      .query("discoveryLinkCandidates")
      .withIndex("by_job_and_state", (q) =>
        q.eq("jobId", args.jobId).eq("state", "pending"),
      )
      .collect();
    return pending.length;
  },
});

export const failJob = internalMutation({
  args: {
    jobId: v.id("documentDiscoveryJobs"),
    errorMessage: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.jobId, {
      status: "failed",
      errorMessage: args.errorMessage,
      phaseDetail: undefined,
    });
  },
});

export const patchJob = internalMutation({
  args: {
    jobId: v.id("documentDiscoveryJobs"),
    status: v.optional(
      v.union(
        v.literal("queued"),
        v.literal("mapping"),
        v.literal("context"),
        v.literal("persisting"),
        v.literal("completed"),
        v.literal("failed"),
      ),
    ),
    phaseDetail: v.optional(v.string()),
    totalCandidates: v.optional(v.number()),
    savedCount: v.optional(v.number()),
    skippedDuplicateCount: v.optional(v.number()),
    errorMessage: v.optional(v.string()),
    discoverySeedUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { jobId, ...rest } = args;
    const patch: Record<string, unknown> = {};
    if (rest.status !== undefined) patch.status = rest.status;
    if (rest.phaseDetail !== undefined) patch.phaseDetail = rest.phaseDetail;
    if (rest.totalCandidates !== undefined) {
      patch.totalCandidates = rest.totalCandidates;
    }
    if (rest.savedCount !== undefined) patch.savedCount = rest.savedCount;
    if (rest.skippedDuplicateCount !== undefined) {
      patch.skippedDuplicateCount = rest.skippedDuplicateCount;
    }
    if (rest.errorMessage !== undefined) {
      patch.errorMessage = rest.errorMessage;
    }
    if (rest.discoverySeedUrl !== undefined) {
      patch.discoverySeedUrl = rest.discoverySeedUrl;
    }
    await ctx.db.patch(jobId, patch);
  },
});

const candidateInput = v.object({
  normalizedUrl: v.string(),
  url: v.string(),
  title: v.string(),
  documentType: documentTypeValidator,
});

export const insertCandidates = internalMutation({
  args: {
    jobId: v.id("documentDiscoveryJobs"),
    candidates: v.array(candidateInput),
  },
  handler: async (ctx, args) => {
    for (const c of args.candidates) {
      await ctx.db.insert("discoveryLinkCandidates", {
        jobId: args.jobId,
        normalizedUrl: c.normalizedUrl,
        url: c.url,
        title: c.title,
        documentType: c.documentType,
        state: "pending",
      });
    }
  },
});

export const applyContextTitles = internalMutation({
  args: {
    jobId: v.id("documentDiscoveryJobs"),
    updates: v.array(
      v.object({
        normalizedUrl: v.string(),
        title: v.string(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const byNorm = new Map(
      args.updates.map((u) => [u.normalizedUrl.toLowerCase(), u.title]),
    );
    const candidates = await ctx.db
      .query("discoveryLinkCandidates")
      .withIndex("by_job_and_state", (q) =>
        q.eq("jobId", args.jobId).eq("state", "pending"),
      )
      .collect();
    for (const row of candidates) {
      const t = byNorm.get(row.normalizedUrl);
      if (t && t.trim()) {
        await ctx.db.patch(row._id, { title: t });
      }
    }
  },
});

export const markCandidateInserted = internalMutation({
  args: { candidateId: v.id("discoveryLinkCandidates") },
  handler: async (ctx, args) => {
    const row = await ctx.db.get(args.candidateId);
    if (!row || row.state !== "pending") {
      return;
    }
    await ctx.db.patch(args.candidateId, { state: "inserted" });
    const job = await ctx.db.get(row.jobId);
    if (job) {
      await ctx.db.patch(row.jobId, {
        savedCount: job.savedCount + 1,
      });
    }
  },
});

export const markCandidateSkipped = internalMutation({
  args: { candidateId: v.id("discoveryLinkCandidates") },
  handler: async (ctx, args) => {
    const row = await ctx.db.get(args.candidateId);
    if (!row || row.state !== "pending") {
      return;
    }
    await ctx.db.patch(args.candidateId, { state: "skipped" });
    const job = await ctx.db.get(row.jobId);
    if (job) {
      await ctx.db.patch(row.jobId, {
        skippedDuplicateCount: job.skippedDuplicateCount + 1,
      });
    }
  },
});

export const completeJob = internalMutation({
  args: { jobId: v.id("documentDiscoveryJobs") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.jobId, {
      status: "completed",
      phaseDetail: "Done",
    });
  },
});

export const requestDiscovery = mutation({
  args: { ticker: v.string() },
  handler: async (ctx, args): Promise<{ jobId: Id<"documentDiscoveryJobs"> }> => {
    const company = await ctx.db
      .query("companies")
      .withIndex("by_ticker", (q) => q.eq("ticker", args.ticker))
      .first();

    if (!company) {
      throw new Error(`Company not found with ticker: ${args.ticker}`);
    }
    if (!company.websiteUrl?.trim()) {
      throw new Error(
        `Company ${company.ticker} has no website URL set (expected HKEX listing URL from listings data).`,
      );
    }

    const latest = await ctx.db
      .query("documentDiscoveryJobs")
      .withIndex("by_company", (q) => q.eq("companyId", company._id))
      .order("desc")
      .first();

    if (
      latest &&
      (latest.status === "queued" ||
        latest.status === "mapping" ||
        latest.status === "context" ||
        latest.status === "persisting")
    ) {
      return { jobId: latest._id };
    }

    const jobId = await ctx.db.insert("documentDiscoveryJobs", {
      companyId: company._id,
      ticker: company.ticker,
      status: "queued",
      totalCandidates: 0,
      savedCount: 0,
      skippedDuplicateCount: 0,
      phaseDetail: "Queued…",
    });

    await ctx.scheduler.runAfter(
      0,
      internal.documentDiscoveryActions.mapPhase,
      { jobId },
    );

    return { jobId };
  },
});
