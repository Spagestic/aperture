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
    websiteUrl: v.optional(v.string()), // Kept as general websiteUrl, Firecrawl will explore to find IR pages
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
});
