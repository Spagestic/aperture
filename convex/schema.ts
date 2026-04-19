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
    .index("by_user_and_event", ["userId", "eventSlug"])
    .index("by_user", ["userId"]),

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
    level: v.union(v.literal("info"), v.literal("warn"), v.literal("error")),
    message: v.string(),
  }).index("by_run", ["runId"]),
});
