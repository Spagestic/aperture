// lib/tools/firecrawl.ts
import FirecrawlApp from "@mendable/firecrawl-js";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";

const firecrawl = new FirecrawlApp({ apiKey: process.env.FIRECRAWL_API_KEY });

export const scrapeWebsiteTool = new DynamicStructuredTool({
  name: "scrape_website",
  description: "Scrape content from any website URL",
  schema: z.object({
    url: z.string().url().describe("The URL to scrape"),
  }),
  func: async ({ url }) => {
    console.log("Scraping:", url);
    const result = await firecrawl.scrape(url, {
      formats: ["markdown"],
    });
    const resData = result as unknown as { data?: { markdown?: string } };
    return (
      result.markdown ||
      (resData.data && resData.data.markdown) ||
      "No content scraped"
    );
  },
});

export const searchWebTool = new DynamicStructuredTool({
  name: "search_web",
  description: "Search the web for information using Firecrawl",
  schema: z.object({
    query: z.string().describe("Search query"),
  }),
  func: async ({ query }) => {
    console.log("Searching:", query);
    const result = await firecrawl.search(query, {
      limit: 3,
      scrapeOptions: { formats: ["markdown"] },
    });

    const rData = result as unknown as {
      success?: boolean;
      data?: { url?: string; markdown?: string }[];
    };
    if (rData.success === false) return "Search failed";

    if (rData.data && Array.isArray(rData.data)) {
      return rData.data
        .map((r) => `Source: ${r.url}\nContent: ${r.markdown}`)
        .join("\n\n---\n\n");
    }

    if (result.web && Array.isArray(result.web)) {
      const resWeb = result.web as { url?: string; markdown?: string }[];
      return resWeb
        .map((r) => `Source: ${r.url}\nContent: ${r.markdown}`)
        .join("\n\n---\n\n");
    }

    return "Search completed, but no web data was found";
  },
});
