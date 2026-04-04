import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

// The schema is normally optional, but Convex Auth
// requires indexes defined on `authTables`.
// The schema provides more precise TypeScript types.
export default defineSchema({
  ...authTables,

  users: defineTable({
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.float64()),
    image: v.optional(v.string()),
    isAnonymous: v.optional(v.boolean()),
    name: v.optional(v.string()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.float64()),
  })
    .index("email", ["email"])
    .index("phone", ["phone"]),

  companies: defineTable({
    ticker: v.string(),
    name: v.string(),
    exchange: v.string(),
    websiteUrl: v.optional(v.string()),
    /** Latest document published date for this company (YYYY-MM-DD), denormalized from documents */
    latestFilingDate: v.optional(v.string()),
    /** Country of headquarters or primary listing jurisdiction */
    country: v.optional(v.string()),
    /** Broad sector label, e.g. Technology, Financials */
    sector: v.optional(v.string()),
    /** Narrower industry within sector */
    industry: v.optional(v.string()),
    /** Trading / reporting currency when relevant, e.g. HKD */
    currency: v.optional(v.string()),
    /** HK Main Board vs GEM, or free text */
    listedBoard: v.optional(v.string()),
    /** Short one-line description for UI */
    description: v.optional(v.string()),
    category: v.optional(v.string()),
    subCategory: v.optional(v.string()),
    boardLot: v.optional(v.string()),
    isin: v.optional(v.string()),
    rmbCounter: v.optional(v.string()),
  }).index("by_ticker", ["ticker"]),

  documents: defineTable({
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
    markdownContent: v.optional(v.string()),
    status: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("completed"),
      v.literal("failed"),
    ),
  })
    .index("by_company", ["companyId"])
    .index("by_status", ["status"]),

  documentDiscoveryJobs: defineTable({
    companyId: v.id("companies"),
    ticker: v.string(),
    status: v.union(
      v.literal("queued"),
      v.literal("mapping"),
      v.literal("context"),
      v.literal("persisting"),
      v.literal("completed"),
      v.literal("failed"),
    ),
    errorMessage: v.optional(v.string()),
    totalCandidates: v.number(),
    savedCount: v.number(),
    skippedDuplicateCount: v.number(),
    phaseDetail: v.optional(v.string()),
    /** URL Firecrawl searched/crawled (IR page or listing fallback) */
    discoverySeedUrl: v.optional(v.string()),
  }).index("by_company", ["companyId"]),

  discoveryLinkCandidates: defineTable({
    jobId: v.id("documentDiscoveryJobs"),
    normalizedUrl: v.string(),
    url: v.string(),
    title: v.string(),
    documentType: v.union(
      v.literal("Annual Report"),
      v.literal("Interim Report"),
      v.literal("Announcement"),
      v.literal("Press Release"),
      v.literal("Other"),
    ),
    state: v.union(
      v.literal("pending"),
      v.literal("inserted"),
      v.literal("skipped"),
    ),
  }).index("by_job_and_state", ["jobId", "state"]),
});
