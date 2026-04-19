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

  researchRuns: defineTable({
    eventSlug: v.string(),
    eventTitle: v.optional(v.string()),
    eventDescription: v.optional(v.string()),
    eventUrl: v.optional(v.string()),
    eventMarketsJson: v.optional(v.string()),
    userId: v.optional(v.id("users")),
    workflowId: v.optional(v.string()),
    status: v.union(
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
    ),
    isSpeculative: v.optional(v.boolean()),
    speculativeReason: v.optional(v.string()),
    planQuestions: v.optional(v.array(v.string())),
    finalReport: v.optional(v.string()),
    errorMessage: v.optional(v.string()),
    startedAt: v.number(),
    completedAt: v.optional(v.number()),
  })
    .index("by_event_slug", ["eventSlug"])
    .index("by_user_and_event", ["userId", "eventSlug"]),

  researchQuestions: defineTable({
    runId: v.id("researchRuns"),
    question: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("searching"),
      v.literal("scraping"),
      v.literal("summarizing"),
      v.literal("done"),
      v.literal("failed"),
    ),
    iteration: v.number(),
    consolidatedSummary: v.optional(v.string()),
    errorMessage: v.optional(v.string()),
  }).index("by_run", ["runId"]),

  researchSearchResults: defineTable({
    runId: v.id("researchRuns"),
    questionId: v.id("researchQuestions"),
    iteration: v.number(),
    url: v.string(),
    title: v.optional(v.string()),
    snippet: v.optional(v.string()),
    source: v.optional(v.string()),
    decision: v.union(
      v.literal("pending"),
      v.literal("skip"),
      v.literal("scrape"),
      v.literal("scraped"),
      v.literal("scrape_failed"),
    ),
    decisionReason: v.optional(v.string()),
  })
    .index("by_question", ["questionId"])
    .index("by_run", ["runId"]),

  researchSources: defineTable({
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
  })
    .index("by_question", ["questionId"])
    .index("by_run", ["runId"]),

  researchMarketPicks: defineTable({
    runId: v.id("researchRuns"),
    marketId: v.string(),
    marketQuestion: v.optional(v.string()),
    side: v.union(
      v.literal("YES"),
      v.literal("NO"),
      v.literal("AVOID"),
      v.literal("WATCH"),
    ),
    conviction: v.number(),
    rationale: v.string(),
    keyRisk: v.string(),
  }).index("by_run", ["runId"]),

  researchLogs: defineTable({
    runId: v.id("researchRuns"),
    ts: v.number(),
    phase: v.string(),
    level: v.union(
      v.literal("info"),
      v.literal("warn"),
      v.literal("error"),
    ),
    message: v.string(),
  }).index("by_run", ["runId"]),
});
