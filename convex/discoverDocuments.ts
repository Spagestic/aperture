import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import type { Id } from "./_generated/dataModel";

/**
 * @deprecated Prefer `api.documentDiscovery.requestDiscovery` from the client so the
 * job runs in the background with progress. This action only kicks off the same pipeline.
 */
export const mapCompanyDocuments = action({
  args: {
    ticker: v.string(),
  },
  handler: async (
    ctx,
    args,
  ): Promise<{
    success: boolean;
    message: string;
    documentsAdded: number;
    linksTried: number;
    discoveredLinks: string[];
    jobId: Id<"documentDiscoveryJobs"> | null;
  }> => {
    const { jobId } = await ctx.runMutation(api.documentDiscovery.requestDiscovery, {
      ticker: args.ticker,
    });

    return {
      success: true,
      message:
        "Discovery started in the background. Refresh-safe progress is available on the ticker workspace.",
      documentsAdded: 0,
      linksTried: 0,
      discoveredLinks: [],
      jobId,
    };
  },
});
