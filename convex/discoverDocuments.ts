import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

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
  }> => {
    const company = await ctx.runQuery(api.companies.getByTicker, {
      ticker: args.ticker,
    });

    if (!company) {
      throw new Error(`Company not found with ticker: ${args.ticker}`);
    }

    if (!company.websiteUrl) {
      throw new Error(`Company ${company.ticker} has no websiteUrl set.`);
    }

    console.log(
      `Starting Firecrawl map for ${company.ticker} at ${company.websiteUrl}`,
    );

    const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY;
    if (!FIRECRAWL_API_KEY) {
      throw new Error(
        "Missing FIRECRAWL_API_KEY environment variable in Convex.",
      );
    }

    // Use Firecrawl /v1/map endpoint to intelligently find sub-pages based on a search intent
    const firecrawlUrl = "https://api.firecrawl.dev/v1/map";
    const mapResponse = await fetch(firecrawlUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
      },
      body: JSON.stringify({
        url: company.websiteUrl,
        search:
          "investor relations, annual report, interim report, announcement, financials",
        limit: 100, // Keep it fast
      }),
    });

    if (!mapResponse.ok) {
      const err = await mapResponse.text();
      console.error("Firecrawl API error:", err);
      throw new Error(`Failed to map via Firecrawl: ${err}`);
    }

    const output = await mapResponse.json();
    console.log("Map result:", output);

    const links: string[] = output.links || [];

    // Filter for PDF links or common report pages
    const pdfLinks = links.filter(
      (link) =>
        link.toLowerCase().endsWith(".pdf") ||
        link.toLowerCase().includes("report") ||
        link.toLowerCase().includes("announcement"),
    );

    console.log(`Found ${pdfLinks.length} potential documents/PDFs.`);

    // Insert these findings into Convex DB as "pending" documents.
    const addedDocs: string[] = [];
    for (const link of pdfLinks) {
      let type:
        | "Annual Report"
        | "Interim Report"
        | "Announcement"
        | "Press Release"
        | "Other" = "Announcement";
      if (link.toLowerCase().includes("annual")) type = "Annual Report";
      if (link.toLowerCase().includes("interim")) type = "Interim Report";

      try {
        const newDocId = await ctx.runMutation(api.documents.create, {
          companyId: company._id,
          type: type,
          title: `Document from ${link.split("/").pop() || link}`,
          pdfUrl: link,
          // Placeholder date, to be refined during OCR if needed
          publishedDate: new Date().toISOString(),
        });
        addedDocs.push(newDocId);
      } catch (err) {
        console.error("Failed to add document record:", err);
      }
    }

    return {
      success: true,
      message: `Finished mapping ${company.websiteUrl}. Found ${pdfLinks.length} docs.`,
      documentsAdded: addedDocs.length,
      linksTried: links.length,
      discoveredLinks: pdfLinks,
    };
  },
});
